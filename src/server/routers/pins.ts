import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const pinsRouter = router({
  /**
   * Get all pins (public)
   */
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0 } = input || {}

      const { data: pins, error } = await ctx.supabase
        .from('pins')
        .select(`
          *,
          profiles:created_by (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw new Error(error.message)

      return pins
    }),

  /**
   * Get a single pin by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: pin, error } = await ctx.supabase
        .from('pins')
        .select(`
          *,
          profiles:created_by (
            id,
            username,
            display_name,
            avatar_url
          ),
          board_pins (
            board_id,
            boards (
              id,
              name
            )
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) throw new Error(error.message)
      if (!pin) throw new Error('Pin not found')

      return pin
    }),

  /**
   * Get pins by user
   */
  getByUser: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: pins, error } = await ctx.supabase
        .from('pins')
        .select(`
          *,
          profiles:created_by (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('created_by', input.userId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return pins
    }),

  /**
   * Create a new pin (protected)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        imageUrl: z.string().url(),
        imageWidth: z.number().positive(),
        imageHeight: z.number().positive(),
        sourceUrl: z.string().url().or(z.literal('')).optional(),
        boardId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, ...pinData } = input

      // 1. Create the pin
      const { data: pin, error: pinError } = await ctx.supabase
        .from('pins')
        .insert({
          title: pinData.title,
          description: pinData.description,
          image_url: pinData.imageUrl,
          image_width: pinData.imageWidth,
          image_height: pinData.imageHeight,
          source_url: pinData.sourceUrl,
          created_by: ctx.user.id,
        })
        .select()
        .single()

      if (pinError) throw new Error(pinError.message)
      if (!pin) throw new Error('Failed to create pin')

      // 2. If boardId provided, add pin to board
      if (boardId) {
        const { error: boardPinError } = await ctx.supabase
          .from('board_pins')
          .insert({
            board_id: boardId,
            pin_id: pin.id,
          })

        if (boardPinError) {
          // Rollback: delete the pin if adding to board fails
          await ctx.supabase.from('pins').delete().eq('id', pin.id)
          throw new Error(`Failed to add pin to board: ${boardPinError.message}`)
        }
      }

      return pin
    }),

  /**
   * Update a pin (protected, owner only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        sourceUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const { data: pin, error } = await ctx.supabase
        .from('pins')
        .update({
          title: updates.title,
          description: updates.description,
          source_url: updates.sourceUrl,
        })
        .eq('id', id)
        .eq('created_by', ctx.user.id) // Ensure user owns the pin
        .select()
        .single()

      if (error) throw new Error(error.message)
      if (!pin) throw new Error('Pin not found or unauthorized')

      return pin
    }),

  /**
   * Delete a pin (protected, owner only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('pins')
        .delete()
        .eq('id', input.id)
        .eq('created_by', ctx.user.id) // Ensure user owns the pin

      if (error) throw new Error(error.message)

      return { success: true }
    }),

  /**
   * Search pins by text
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: pins, error } = await ctx.supabase
        .rpc('search_pins', { search_query: input.query })

      if (error) throw new Error(error.message)

      return pins
    }),
})
