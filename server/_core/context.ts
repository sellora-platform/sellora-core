/**
 * Sellora tRPC Context
 *
 * Creates the context object passed to every tRPC procedure.
 * Authenticates the request using our JWT session system.
 */
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { SessionUser } from "./auth";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: SessionUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: SessionUser | null = null;

  try {
    const result = await authenticateRequest(opts.req);
    user = result.user;
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
