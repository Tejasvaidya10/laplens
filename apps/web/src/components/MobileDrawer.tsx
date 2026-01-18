import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onRunAnalysis: () => void
  isLoading?: boolean
}

export function MobileDrawer({ isOpen, onClose, onRunAnalysis, isLoading }: MobileDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-zinc-950 border-r border-zinc-800 overflow-auto">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-semibold text-white">Setup</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <Sidebar
            onRunAnalysis={() => {
              onClose()
              onRunAnalysis()
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
