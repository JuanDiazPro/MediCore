import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { crearQueryClient } from '@/app/queryClient'

import { Toaster } from '@/components/ui/toast'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(crearQueryClient)
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
