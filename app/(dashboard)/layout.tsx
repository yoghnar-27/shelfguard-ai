import { AppShell } from "@/components/dashboard/app-shell"
import { Topbar } from "@/components/dashboard/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <Topbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </AppShell>
  )
}
