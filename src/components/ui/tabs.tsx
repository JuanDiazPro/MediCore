import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-soft sm:w-fit',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:text-navy focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none data-[state=active]:bg-brand data-[state=active]:text-white [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-6 outline-none', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
