"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { workspace } from "@/lib/mock"

const titles: Record<string, string> = {
  "/": "Command Center",
  "/watchlist": "Watchlist",
  "/products": "Products",
  "/opportunities": "Opportunities",
  "/health": "Scraper Health",
  "/activity": "Activity",
}

function titleFor(pathname: string) {
  if (pathname.startsWith("/products/")) return "Product intelligence"
  return titles[pathname] ?? "ShelfGuard AI"
}

export function Topbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{titleFor(pathname)}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {workspace.seller} · {workspace.region}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-gold/25 bg-gold/8 px-2.5 py-1 text-[11px] text-gold sm:inline">
          Demo data only
        </span>
        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
          {workspace.collectorId}
        </span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>ShelfGuard AI primary navigation</SheetDescription>
          </SheetHeader>
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
