import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/routers/_app'

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Get base URL for API requests
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return ''
  }

  // SSR should use full URL
  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`
  }

  // Local development
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * Create tRPC client configuration
 */
export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        // You can pass any HTTP headers you wish here
        async headers() {
          return {
            // Include cookies for authentication
          }
        },
      }),
    ],
  })
}
