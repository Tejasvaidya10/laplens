import { X } from 'lucide-react'
import { SessionSelector } from '@/components/selectors/SessionSelector'
import { DriverSelector } from '@/components/selectors/DriverSelector'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 border-r bg-background p-6 shadow-lg animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Session & Drivers</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Session Selection
            </h3>
            <SessionSelector />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Driver Comparison
            </h3>
            <DriverSelector />
          </div>
        </div>
      </div>
    </div>
  )
}
