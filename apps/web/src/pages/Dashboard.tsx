import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpeedChart, ThrottleBrakeChart, GearChart, DeltaChart, RacePaceChart } from '@/components/charts';
import { api } from '@/lib/api';
import { useSessionStore } from '@/hooks/use-session-store';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const { season, event, session, driverA, driverB } = useSessionStore();

  const canCompare = season && event && session && driverA && driverB;

  const { data: telemetry, isLoading, error, refetch, isFetched } = useQuery({
    queryKey: ['telemetry', season, event, session, driverA, driverB],
    queryFn: () => api.compareTelemetry({
      season: season!,
      event: event!,
      session: session!,
      driverA: driverA!,
      driverB: driverB!,
    }),
    enabled: false,
  });

  const { data: racePace, isLoading: racePaceLoading, refetch: refetchRacePace } = useQuery({
    queryKey: ['racePace', season, event, session, driverA, driverB],
    queryFn: () => api.getRacePace(
      season!,
      event!,
      session!,
      [driverA!, driverB!]
    ),
    enabled: false,
  });

  const handleCompare = () => {
    if (canCompare) {
      refetch();
      // Only fetch race pace for race sessions
      if (session === 'R') {
        refetchRacePace();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">LapLens - F1 Telemetry Analysis</h1>
      
      {!canCompare && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Select a season, event, session, and two drivers from the sidebar to compare telemetry.
            </p>
          </CardContent>
        </Card>
      )}

      {canCompare && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p>Ready to compare <strong>{driverA}</strong> vs <strong>{driverB}</strong></p>
              <Button onClick={handleCompare} disabled={isLoading || racePaceLoading}>
                {(isLoading || racePaceLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Compare Telemetry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {(error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {telemetry && (
        <Tabs defaultValue="speed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="speed">Speed</TabsTrigger>
            <TabsTrigger value="throttle">Throttle/Brake</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="delta">Delta</TabsTrigger>
            {session === 'R' && <TabsTrigger value="racepace">Race Pace</TabsTrigger>}
          </TabsList>

          <TabsContent value="speed">
            <Card>
              <CardHeader>
                <CardTitle>Speed Trace</CardTitle>
              </CardHeader>
              <CardContent>
                <SpeedChart data={telemetry} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="throttle">
            <Card>
              <CardHeader>
                <CardTitle>Throttle & Brake</CardTitle>
              </CardHeader>
              <CardContent>
                <ThrottleBrakeChart data={telemetry} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gear">
            <Card>
              <CardHeader>
                <CardTitle>Gear</CardTitle>
              </CardHeader>
              <CardContent>
                <GearChart data={telemetry} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delta">
            <Card>
              <CardHeader>
                <CardTitle>Lap Time Delta</CardTitle>
              </CardHeader>
              <CardContent>
                <DeltaChart data={telemetry} />
              </CardContent>
            </Card>
          </TabsContent>

          {session === 'R' && (
            <TabsContent value="racepace">
              {racePaceLoading ? (
                <Card>
                  <CardContent className="pt-6 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading race pace data...</span>
                  </CardContent>
                </Card>
              ) : racePace ? (
                <RacePaceChart data={racePace} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Race pace data not available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

export default Dashboard;
