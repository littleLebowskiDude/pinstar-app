import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

/**
 * Search router - handles searching pins and boards
 */
export const searchRouter = router({
  /**
   * Search pins by text
   * Uses PostgreSQL full-text search on title and description
   * Only returns pins created by the current user
   */
  pins: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id

      if (!userId) {
        return []
      }

      const { data: pins, error } = await ctx.supabase
        .rpc('search_pins', {
          search_query: input.query,
          user_id: userId
        })
        .limit(input.limit)

      if (error) throw new Error(error.message)

      return pins as Array<{
        id: string
        title: string
        description: string | null
        image_url: string
        image_width: number | null
        image_height: number | null
        source_url: string | null
        source: string | null
        attribution: any | null
        created_by: string
        created_at: string
        rank: number
      }>
    }),

  /**
   * Search boards by text
   * Uses PostgreSQL full-text search on name and description
   * Respects privacy settings (only returns public boards or user's own boards)
   */
  boards: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id || null

      const { data: boards, error } = await ctx.supabase
        .rpc('search_boards', {
          search_query: input.query,
          user_id: userId,
        })
        .limit(input.limit)

      if (error) throw new Error(error.message)

      return boards as Array<{
        id: string
        name: string
        description: string | null
        cover_image_url: string | null
        owner_id: string
        is_private: boolean
        created_at: string
        updated_at: string
        rank: number
      }>
    }),

  /**
   * Search both pins and boards
   * Returns top results from each
   * Only searches the current user's pins and boards
   */
  all: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        pinLimit: z.number().min(1).max(50).optional().default(5),
        boardLimit: z.number().min(1).max(50).optional().default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id || null

      // If no user is logged in, return empty results
      if (!userId) {
        return {
          pins: [],
          boards: [],
        }
      }

      // Search pins and boards in parallel
      const [pinsResult, boardsResult] = await Promise.all([
        ctx.supabase
          .rpc('search_pins', {
            search_query: input.query,
            user_id: userId,
          })
          .limit(input.pinLimit),
        ctx.supabase
          .rpc('search_boards', {
            search_query: input.query,
            user_id: userId,
          })
          .limit(input.boardLimit),
      ])

      if (pinsResult.error) throw new Error(pinsResult.error.message)
      if (boardsResult.error) throw new Error(boardsResult.error.message)

      return {
        pins: pinsResult.data as Array<{
          id: string
          title: string
          description: string | null
          image_url: string
          image_width: number | null
          image_height: number | null
          source_url: string | null
          source: string | null
          attribution: any | null
          created_by: string
          created_at: string
          rank: number
        }>,
        boards: boardsResult.data as Array<{
          id: string
          name: string
          description: string | null
          cover_image_url: string | null
          owner_id: string
          is_private: boolean
          created_at: string
          updated_at: string
          rank: number
        }>,
      }
    }),
})
