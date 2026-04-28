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

  // 1. Extract storeId from all possible sources
  // Priority: Parsed Input > Raw Input (handle batching) > Query Params
  let storeId: any;

  // Case A: Already parsed input (if middleware runs after .input())
  if (input && typeof input === 'object' && 'storeId' in input) {
    storeId = (input as any).storeId;
  } 
  // Case B: Raw Input (handle tRPC batching where rawInput might be { "0": { ... } })
  else if (rawInput && typeof rawInput === 'object') {
    if ('storeId' in rawInput) {
      storeId = (rawInput as any).storeId;
    } else {
      // Check for batching index (usually "0", "1", etc.)
      const firstKey = Object.keys(rawInput)[0];
      if (firstKey && /^\d+$/.test(firstKey)) {
        storeId = (rawInput as any)[firstKey]?.storeId;
      }
    }
  }

  // Case C: Query Params fallback
  if (storeId === undefined && ctx.req.query.storeId) {
    storeId = ctx.req.query.storeId;
  }

  // 2. Convert to number and validate
  const numericStoreId = typeof storeId === "string" ? parseInt(storeId, 10) : Number(storeId);

  if (!numericStoreId || isNaN(numericStoreId)) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: `Operation requires a valid storeId (found: ${storeId})` 
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
