import { AuditEngine } from '../utils/audit';
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import * as db from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Global Audit Middleware for Mutations
 */
const auditMiddleware = t.middleware(async (opts) => {
  const { ctx, path, type, next } = opts;
  const result = await next();

  // We only audit mutations (actions that change data)
  if (type === "mutation" && ctx.user) {
    const isError = !result.ok;
    const errorCode = isError ? (result.error as TRPCError).code : null;

    await AuditEngine.log({
      userId: ctx.user.id,
      actionType: `TRPC_MUTATION:${path}`,
      success: result.ok,
      correlationId: ctx.correlationId,
      metadata: {
        path,
        errorCode,
        input: (opts as any).rawInput || (opts as any).input,
        errorMessage: isError ? (result.error as Error).message : null,
      },
    });
  }

  return result;
});

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Tenant Guard Middleware
 * 
 * Extends protectedProcedure to verify store ownership.
 * Injects verified storeId into the context.
 */
const storeGuard = t.middleware(async (opts) => {
  const { ctx, input, next } = opts;
  const rawInput = (opts as any).rawInput;
  
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // 1. ROBUST EXTRACTION: Try all possible tRPC input locations
  let storeId: any = undefined;

  // Case A: Standard input object
  if (input && typeof input === 'object' && 'storeId' in input) {
    storeId = (input as any).storeId;
  } 
  
  // Case B: Raw input (rawInput) fallback
  if (storeId === undefined && rawInput && typeof rawInput === 'object') {
    if ('storeId' in rawInput) {
      storeId = (rawInput as any).storeId;
    } else {
      // Handle tRPC batching (input might be an array or indexed object)
      const firstKey = Object.keys(rawInput)[0];
      if (firstKey && /^\d+$/.test(firstKey)) {
        storeId = (rawInput as any)[firstKey]?.storeId;
      }
    }
  }

  // Case C: Query parameter fallback (for some GET requests)
  if (storeId === undefined && ctx.req.query.storeId) {
    storeId = ctx.req.query.storeId;
  }

  // 2. Convert and validate (Allow 0 if it's a valid ID, but check for null/undefined/NaN)
  const numericStoreId = (storeId !== undefined && storeId !== null) ? Number(storeId) : NaN;

  if (isNaN(numericStoreId)) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: `storeId is required` 
    });
  }

  // 3. Verify ownership in DB
  const store = await db.getStoreByMerchantId(ctx.user.id);
  
  if (!store || store.id !== numericStoreId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: `Unauthorized access: Store ${numericStoreId} does not belong to user ${ctx.user.id}.` 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      storeId: numericStoreId,
    },
  });
});

export const protectedStoreProcedure = protectedProcedure.use(storeGuard);

/**
 * Use this procedure for all sensitive mutations to ensure they are audited.
 */
export const auditedProcedure = protectedProcedure.use(auditMiddleware);

/**
 * Audited version of the store procedure for data-modifying actions.
 */
export const auditedStoreProcedure = protectedStoreProcedure.use(auditMiddleware);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
