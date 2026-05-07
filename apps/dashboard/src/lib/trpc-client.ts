import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";
import superjson from "superjson";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      // Superjson for proper Date/JSONB handling
      transformer: superjson,
    }),
  ],
});
