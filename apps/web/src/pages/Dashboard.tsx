import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionSelector } from '@/components/selectors/SessionSelector';
import { DriverSelector } from '@/components/selectors/DriverSelector';
import { SpeedChart, ThrottleBrakeChart, GearChart, DeltaChart } from '@/components/charts';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const [season, setSeason] = useState<number | null>(null);
  const [event, setEvent] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [driverA, setDriverA] = useState<string | null>(null);
  const [driverB, setDriverB] = useState<string | null>(null);

  const { data: telemetry, isLoading, error, refetch } = useQuery({
    queryKey: ['telemetry', season, event, session, driverA, driverB],
    queryFn: () => api.compareTelemetry({
      season: season!,
      event: event!,
      session: session!,
      driverA: driverA!,
      driverB: driverB!,
    }),
    enabled: !!(season && event && session && driverA && driverB),
  });

  const canCompare = season && event && session && driverA && driverB;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">LapLens - F1 Telemetry Analysis</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Session</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionSelector
            season={season}
            event={event}
            session={session}
            onSeasonChange={setSeason}
            onEventChange={setEvent}
            onSessionChange={setSession}
          />
        </CardContent>
      </Card>

      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Select Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverSelector
              season={season!}
              event={event!}
              session={session}
              driverA={driverA}
              driverB={driverB}
              onDriverAChange={setDriverA}
              onDriverBChange={setDriverB}
            />
            <Button 
              className="mt-4" 
              onClick={() => refetch()}
              disabled={!canCompare || isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Compare
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading telemetry: {(error as Error).message}</p>
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
        </Tabs>
      )}
    </div>
  );
}

export default Dashboard;
