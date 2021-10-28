import {QueryClient, QueryClientProvider} from 'react-query'

import {ComponentType} from 'react'

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
