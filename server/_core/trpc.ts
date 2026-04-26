import { AuditEngine } from '../utils/audit';
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

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
 * Use this procedure for all sensitive mutations to ensure they are audited.
 */
export const auditedProcedure = protectedProcedure.use(auditMiddleware);

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
