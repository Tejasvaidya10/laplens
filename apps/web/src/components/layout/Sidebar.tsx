import { SessionSelector } from '@/components/selectors/SessionSelector'
import { DriverSelector } from '@/components/selectors/DriverSelector'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-80 border-r bg-card/50 min-h-[calc(100vh-4rem)]">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Session Selection
          </h2>
          <SessionSelector />
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Driver Comparison
          </h2>
          <DriverSelector />
        </div>
      </div>
    </aside>
  )
}
