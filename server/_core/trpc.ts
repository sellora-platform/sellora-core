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
  const { ctx, rawInput, next } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // 1. Extract storeId from input or query
  const input = rawInput as { storeId?: number };
  let storeId = input?.storeId;

  if (storeId === undefined && ctx.req.query.storeId) {
    storeId = parseInt(ctx.req.query.storeId as string);
  }

  if (!storeId || isNaN(storeId)) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: "Operation requires a valid storeId" 
    });
  }

  // 2. Verify ownership in DB
  // Merchant must be the owner of the requested storeId
  const store = await db.getStoreByMerchantId(ctx.user.id);
  
  if (!store || store.id !== storeId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You do not have permission to access this store's data." 
    });
  }

  return next({
    ctx: {
      ...ctx,
      storeId,
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
