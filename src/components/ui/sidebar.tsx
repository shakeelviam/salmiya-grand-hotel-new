"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronDown, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils/styles"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useSidebar } from '@/components/providers/sidebar-provider'
import { navItems } from '@/config/nav'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'

const sidebarVariants = cva('relative h-full', {
  variants: {
    variant: {
      default: 'bg-background border-r',
      overlay: 'bg-background/80 backdrop-blur-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  asChild?: boolean
}

export function Sidebar({
  className,
  variant,
  asChild = false,
  ...props
}: SidebarProps) {
  const { state, openMobile, setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname()
  const Comp = asChild ? Slot : 'aside'
  const [openSections, setOpenSections] = React.useState<string[]>([])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  const NavContent = () => (
    <nav className="space-y-4 py-4">
      {navItems.map((section) => (
        <Collapsible
          key={section.title}
          open={openSections.includes(section.title)}
          onOpenChange={() => toggleSection(section.title)}
        >
          <div className="px-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center px-2 py-2 text-sm font-semibold tracking-tight hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer">
                <ChevronDown
                  className={cn(
                    'h-4 w-4 mr-1 transition-transform duration-200',
                    openSections.includes(section.title) ? 'transform rotate-0' : '-rotate-90'
                  )}
                />
                {section.title}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <TooltipProvider key={item.href}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-x-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className={cn(
                            'transition-opacity duration-200',
                            state === 'expanded' ? 'opacity-100' : 'opacity-0'
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {state === 'collapsed' && (
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {item.title}
                          <span className="text-muted-foreground text-xs">{item.description}</span>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </nav>
  )

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className={cn(sidebarVariants({ variant }), 'w-[18rem]', className)}
        >
          <NavContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Comp
      data-state={state}
      className={cn(
        sidebarVariants({ variant }),
        '[grid-area:sidebar] overflow-hidden',
        state === 'expanded' ? 'w-[16rem]' : 'w-[3rem]',
        className
      )}
      {...props}
    >
      <NavContent />
    </Comp>
  )
}

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={() => {
        toggleSidebar()
        onClick?.(null as any)
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

export { Sidebar, SidebarTrigger }
