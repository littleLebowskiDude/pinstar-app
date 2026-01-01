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

  // Ensure profile exists for the user (handles cases where trigger didn't fire)
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('id')
    .eq('id', ctx.user.id)
    .single()

  // If profile doesn't exist, create it
  if (!profile) {
    const { error: profileError } = await ctx.supabase
      .from('profiles')
      .insert({
        id: ctx.user.id,
        username: ctx.user.user_metadata?.username || ctx.user.email?.split('@')[0] || `user_${ctx.user.id.substring(0, 8)}`,
        display_name: ctx.user.user_metadata?.display_name || ctx.user.email || 'Anonymous User',
        avatar_url: ctx.user.user_metadata?.avatar_url || '',
      })

    if (profileError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create user profile: ${profileError.message}`,
      })
    }
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now guaranteed to be non-null
    },
  })
})
