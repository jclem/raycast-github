import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ComponentType} from 'react'

const queryClient = new QueryClient()

export default function withQueryClient<P = unknown>(
  Component: ComponentType<P>
): ComponentType<P> {
  return function WithQueryClient(props: P & JSX.IntrinsicAttributes) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    )
  }
}
