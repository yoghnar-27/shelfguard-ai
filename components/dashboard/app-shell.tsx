import { Sidebar } from "@/components/dashboard/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}

export { Topbar } from "@/components/dashboard/topbar"
