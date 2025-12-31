import { router } from '../trpc'
import { pinsRouter } from './pins'
import { boardsRouter } from './boards'
import { searchRouter } from './search'

/**
 * Main application router
 * Combines all sub-routers
 */
export const appRouter = router({
  pins: pinsRouter,
  boards: boardsRouter,
  search: searchRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
