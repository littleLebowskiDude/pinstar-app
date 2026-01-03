import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const boardsRouter = router({
  /**
   * Get all boards for current user (protected)
   */
  getMyBoards: protectedProcedure.query(async ({ ctx }) => {
    const { data: boards, error } = await ctx.supabase
      .from('boards')
      .select(`
        *,
        board_pins (
          pins (
            image_url,
            image_width,
            image_height
          )
        )
      `)
      .eq('owner_id', ctx.user.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Transform to include count
    const boardsWithCount = (boards || []).map((board) => ({
      ...board,
      _count: { board_pins: board.board_pins?.length || 0 }
    }))

    return boardsWithCount
  }),

  /**
   * Get a single board by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: board, error } = await ctx.supabase
        .from('boards')
        .select(`
          *,
          profiles:owner_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          board_pins (
            pin_id,
            position,
            added_at,
            pins (
              id,
              title,
              description,
              image_url,
              image_width,
              image_height,
              source_url,
              source,
              attribution
            )
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) throw new Error(error.message)
      if (!board) throw new Error('Board not found')

      // Check privacy
      if (board.is_private && board.owner_id !== ctx.user?.id) {
        throw new Error('Unauthorized')
      }

      return board
    }),

  /**
   * Get boards by user
   */
  getByUser: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const query = ctx.supabase
        .from('boards')
        .select(`
          *,
          board_pins (
            pins (
              image_url,
              image_width,
              image_height
            )
          )
        `)
        .eq('owner_id', input.userId)
        .order('created_at', { ascending: false })

      // Only show public boards unless it's the current user
      if (ctx.user?.id !== input.userId) {
        query.eq('is_private', false)
      }

      const { data: boards, error } = await query

      if (error) throw new Error(error.message)

      // Transform to include count
      const boardsWithCount = (boards || []).map((board) => ({
        ...board,
        _count: { board_pins: board.board_pins?.length || 0 }
      }))

      return boardsWithCount
    }),

  /**
   * Create a new board (protected)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPrivate: z.boolean().default(false),
        coverImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: board, error } = await ctx.supabase
        .from('boards')
        .insert({
          name: input.name,
          description: input.description,
          is_private: input.isPrivate,
          cover_image_url: input.coverImageUrl,
          owner_id: ctx.user.id,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      return board
    }),

  /**
   * Update a board (protected, owner only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        isPrivate: z.boolean().optional(),
        coverImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const { data: board, error } = await ctx.supabase
        .from('boards')
        .update({
          name: updates.name,
          description: updates.description,
          is_private: updates.isPrivate,
          cover_image_url: updates.coverImageUrl,
        })
        .eq('id', id)
        .eq('owner_id', ctx.user.id) // Ensure user owns the board
        .select()
        .single()

      if (error) throw new Error(error.message)
      if (!board) throw new Error('Board not found or unauthorized')

      return board
    }),

  /**
   * Delete a board (protected, owner only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('boards')
        .delete()
        .eq('id', input.id)
        .eq('owner_id', ctx.user.id) // Ensure user owns the board

      if (error) throw new Error(error.message)

      return { success: true }
    }),

  /**
   * Add a pin to a board (protected, board owner only)
   */
  addPin: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        pinId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, verify user owns the board
      const { data: board } = await ctx.supabase
        .from('boards')
        .select('id, owner_id')
        .eq('id', input.boardId)
        .eq('owner_id', ctx.user.id)
        .single()

      if (!board) {
        throw new Error('Board not found or unauthorized')
      }

      // Get current max position
      const { data: maxPositionData } = await ctx.supabase
        .from('board_pins')
        .select('position')
        .eq('board_id', input.boardId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      const newPosition = (maxPositionData?.position ?? -1) + 1

      // Add pin to board
      const { data: boardPin, error } = await ctx.supabase
        .from('board_pins')
        .insert({
          board_id: input.boardId,
          pin_id: input.pinId,
          position: newPosition,
        })
        .select()
        .single()

      if (error) {
        // Handle duplicate error gracefully
        if (error.code === '23505') {
          throw new Error('Pin already exists in this board')
        }
        throw new Error(error.message)
      }

      return boardPin
    }),

  /**
   * Remove a pin from a board (protected, board owner only)
   */
  removePin: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        pinId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the board via the board_pins policies
      const { error } = await ctx.supabase
        .from('board_pins')
        .delete()
        .eq('board_id', input.boardId)
        .eq('pin_id', input.pinId)

      if (error) throw new Error(error.message)

      return { success: true }
    }),

  /**
   * Reorder pins in a board (protected, board owner only)
   */
  reorderPins: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        pinOrders: z.array(
          z.object({
            pinId: z.string().uuid(),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the board
      const { data: board } = await ctx.supabase
        .from('boards')
        .select('id')
        .eq('id', input.boardId)
        .eq('owner_id', ctx.user.id)
        .single()

      if (!board) {
        throw new Error('Board not found or unauthorized')
      }

      // Update positions
      const updates = input.pinOrders.map(({ pinId, position }) =>
        ctx.supabase
          .from('board_pins')
          .update({ position })
          .eq('board_id', input.boardId)
          .eq('pin_id', pinId)
      )

      await Promise.all(updates)

      return { success: true }
    }),
})
