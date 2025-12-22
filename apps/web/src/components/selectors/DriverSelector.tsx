import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionStore } from '@/hooks/use-session-store'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight } from 'lucide-react'

export function DriverSelector() {
  const {
    season,
    event,
    session,
    driverA,
    driverB,
    setDriverA,
    setDriverB,
  } = useSessionStore()

  // Fetch drivers for selected session
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers', season, event, session],
    queryFn: () => api.getDrivers(season!, event!, session!),
    enabled: !!season && !!event && !!session,
  })

  const canSelectDrivers = !!season && !!event && !!session

  const swapDrivers = () => {
    const tempA = driverA
    setDriverA(driverB)
    setDriverB(tempA)
  }

  return (
    <div className="space-y-4">
      {/* Driver A Selector */}
      <div className="space-y-2">
        <Label htmlFor="driverA" className="text-xs text-muted-foreground">
          Driver A
        </Label>
        {driversLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={driverA || ''}
            onValueChange={setDriverA}
            disabled={!canSelectDrivers}
          >
            <SelectTrigger id="driverA">
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers
                ?.filter((d) => d.code !== driverB)
                .map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.teamColor }}
                      />
                      <span>
                        {d.code} - {d.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={swapDrivers}
          disabled={!driverA || !driverB}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </Button>
      </div>

      {/* Driver B Selector */}
      <div className="space-y-2">
        <Label htmlFor="driverB" className="text-xs text-muted-foreground">
          Driver B
        </Label>
        {driversLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={driverB || ''}
            onValueChange={setDriverB}
            disabled={!canSelectDrivers}
          >
            <SelectTrigger id="driverB">
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers
                ?.filter((d) => d.code !== driverA)
                .map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.teamColor }}
                      />
                      <span>
                        {d.code} - {d.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Selection Summary */}
      {driverA && driverB && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs text-muted-foreground mb-1">Comparing</p>
          <p className="text-sm font-medium">
            {driverA} vs {driverB}
          </p>
        </div>
      )}
    </div>
  )
}
