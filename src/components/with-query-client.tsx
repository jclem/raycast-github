import {ComponentType} from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

const queryClient = new QueryClient()

export default function withQueryClient(
  Component: ComponentType
): ComponentType {
  return function WithQueryClient() {
    return (
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>
    )
  }
}
