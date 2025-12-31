import { initTRPC, TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Context for tRPC procedures
 * Includes Supabase client and authenticated user
 */
export async function createTRPCContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return {
    supabase,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create()

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now guaranteed to be non-null
    },
  })
})
