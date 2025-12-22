import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SpeedChart,
  DeltaChart,
  ThrottleBrakeChart,
  GearChart,
  StrategyChart,
  PositionChart,
  TrackEvolutionChart,
} from '@/components/charts';
import { useSessionStore } from '@/hooks/use-session-store';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Timer,
  TrendingUp,
  Flag,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Dashboard() {
  const { session: authSession } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  
  const {
    season,
    event,
    session,
    driverA,
    driverB,
    lapA,
    lapB,
  } = useSessionStore();

  const canCompare = season && event && session && driverA && driverB;

  // Fetch telemetry comparison
  const {
    data: telemetryData,
    isLoading: telemetryLoading,
    error: telemetryError,
    refetch: refetchTelemetry,
  } = useQuery({
    queryKey: ['telemetry', season, event, session, driverA, driverB, lapA, lapB],
    queryFn: () =>
      apiClient.compareTelemetry({
        season: season!,
        event: event!,
        session: session!,
        driver_a: driverA!,
        driver_b: driverB!,
        lap_a: lapA,
        lap_b: lapB,
      }),
    enabled: canCompare,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch strategy data
  const {
    data: strategyData,
    isLoading: strategyLoading,
  } = useQuery({
    queryKey: ['strategy', season, event, session],
    queryFn: () =>
      apiClient.getStrategy(season!, event!, session!),
    enabled: !!season && !!event && !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch position data
  const {
    data: positionData,
    isLoading: positionLoading,
  } = useQuery({
    queryKey: ['positions', season, event, session],
    queryFn: () =>
      apiClient.getPositions(season!, event!, session!),
    enabled: !!season && !!event && !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch track evolution data
  const {
    data: trackEvolutionData,
    isLoading: trackEvolutionLoading,
  } = useQuery({
    queryKey: ['trackEvolution', season, event, session],
    queryFn: () =>
      apiClient.getTrackEvolution(season!, event!, session!),
    enabled: !!season && !!event && !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Save analysis mutation
  const saveAnalysisMutation = useMutation({
    mutationFn: () =>
      apiClient.createSavedAnalysis({
        name: analysisName,
        season: season!,
        event: event!,
        session: session!,
        driver_a: driverA!,
        driver_b: driverB!,
        lap_a: lapA,
        lap_b: lapB,
      }),
    onSuccess: () => {
      toast({
        title: 'Analysis saved',
        description: 'Your analysis has been saved successfully.',
      });
      setSaveDialogOpen(false);
      setAnalysisName('');
      queryClient.invalidateQueries({ queryKey: ['savedAnalyses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save analysis. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveAnalysis = () => {
    if (!analysisName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your analysis.',
        variant: 'destructive',
      });
      return;
    }
    saveAnalysisMutation.mutate();
  };

  // Empty state
  if (!season || !event || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Activity className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Select a Session</h2>
        <p className="text-muted-foreground max-w-md">
          Choose a season, event, and session from the sidebar to start analyzing
          telemetry data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {event} - {session}
          </h1>
          <p className="text-muted-foreground">Season {season}</p>
        </div>
        
        {authSession && canCompare && (
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Analysis</DialogTitle>
                <DialogDescription>
                  Save this comparison for later. You can access it from the Saved
                  Analyses page.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Analysis Name</Label>
                  <Input
                    id="name"
                    placeholder={`${driverA} vs ${driverB} - ${event}`}
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Season:</strong> {season}</p>
                  <p><strong>Event:</strong> {event}</p>
                  <p><strong>Session:</strong> {session}</p>
                  <p><strong>Drivers:</strong> {driverA} vs {driverB}</p>
                  {lapA && <p><strong>Lap A:</strong> {lapA}</p>}
                  {lapB && <p><strong>Lap B:</strong> {lapB}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAnalysis}
                  disabled={saveAnalysisMutation.isPending}
                >
                  {saveAnalysisMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="telemetry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="telemetry" className="gap-2">
            <Activity className="w-4 h-4 hidden sm:block" />
            Telemetry
          </TabsTrigger>
          <TabsTrigger value="strategy" className="gap-2">
            <Timer className="w-4 h-4 hidden sm:block" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="positions" className="gap-2">
            <Flag className="w-4 h-4 hidden sm:block" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-2">
            <TrendingUp className="w-4 h-4 hidden sm:block" />
            Track Evolution
          </TabsTrigger>
        </TabsList>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-4">
          {!canCompare ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select Two Drivers</p>
                <p className="text-muted-foreground">
                  Choose Driver A and Driver B from the sidebar to compare telemetry.
                </p>
              </CardContent>
            </Card>
          ) : telemetryLoading ? (
            <TelemetryLoadingSkeleton />
          ) : telemetryError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-lg font-medium">Error Loading Telemetry</p>
                <p className="text-muted-foreground mb-4">
                  There was an error fetching the telemetry data.
                </p>
                <Button onClick={() => refetchTelemetry()}>Try Again</Button>
              </CardContent>
            </Card>
          ) : telemetryData ? (
            <>
              {/* Speed Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Speed Trace</CardTitle>
                  <CardDescription>
                    Speed comparison over lap distance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SpeedChart
                    driverA={{
                      code: telemetryData.driver_a.code,
                      team: telemetryData.driver_a.team,
                      data: telemetryData.driver_a.telemetry,
                    }}
                    driverB={{
                      code: telemetryData.driver_b.code,
                      team: telemetryData.driver_b.team,
                      data: telemetryData.driver_b.telemetry,
                    }}
                  />
                </CardContent>
              </Card>

              {/* Delta Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Lap Time Delta</CardTitle>
                  <CardDescription>
                    Time difference between drivers (positive = {telemetryData.driver_b.code} faster)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeltaChart
                    data={telemetryData.delta}
                    driverACode={telemetryData.driver_a.code}
                    driverBCode={telemetryData.driver_b.code}
                  />
                </CardContent>
              </Card>

              {/* Throttle Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Throttle Application</CardTitle>
                  <CardDescription>
                    Throttle percentage over lap distance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThrottleBrakeChart
                    driverA={{
                      code: telemetryData.driver_a.code,
                      team: telemetryData.driver_a.team,
                      data: telemetryData.driver_a.telemetry,
                    }}
                    driverB={{
                      code: telemetryData.driver_b.code,
                      team: telemetryData.driver_b.team,
                      data: telemetryData.driver_b.telemetry,
                    }}
                    mode="throttle"
                  />
                </CardContent>
              </Card>

              {/* Brake Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Brake Application</CardTitle>
                  <CardDescription>
                    Brake percentage over lap distance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThrottleBrakeChart
                    driverA={{
                      code: telemetryData.driver_a.code,
                      team: telemetryData.driver_a.team,
                      data: telemetryData.driver_a.telemetry,
                    }}
                    driverB={{
                      code: telemetryData.driver_b.code,
                      team: telemetryData.driver_b.team,
                      data: telemetryData.driver_b.telemetry,
                    }}
                    mode="brake"
                  />
                </CardContent>
              </Card>

              {/* Gear Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Gear Selection</CardTitle>
                  <CardDescription>
                    Gear changes over lap distance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GearChart
                    driverA={{
                      code: telemetryData.driver_a.code,
                      team: telemetryData.driver_a.team,
                      data: telemetryData.driver_a.telemetry,
                    }}
                    driverB={{
                      code: telemetryData.driver_b.code,
                      team: telemetryData.driver_b.team,
                      data: telemetryData.driver_b.telemetry,
                    }}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle>Tire Strategy</CardTitle>
              <CardDescription>
                Tire compounds and stint lengths for all drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategyLoading ? (
                <StrategyLoadingSkeleton />
              ) : strategyData ? (
                <StrategyChart data={strategyData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No strategy data available for this session.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Position Changes</CardTitle>
              <CardDescription>
                Position vs lap for all drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positionLoading ? (
                <PositionLoadingSkeleton />
              ) : positionData && positionData.length > 0 ? (
                <PositionChart
                  data={positionData}
                  highlightDrivers={[driverA, driverB].filter(Boolean) as string[]}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No position data available for this session.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Track Evolution Tab */}
        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Track Evolution</CardTitle>
              <CardDescription>
                Best lap time progression throughout the session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackEvolutionLoading ? (
                <TrackEvolutionLoadingSkeleton />
              ) : trackEvolutionData && trackEvolutionData.length > 0 ? (
                <TrackEvolutionChart data={trackEvolutionData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No track evolution data available for this session.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading skeletons
function TelemetryLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StrategyLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 flex-1" />
        </div>
      ))}
    </div>
  );
}

function PositionLoadingSkeleton() {
  return <Skeleton className="h-[500px] w-full" />;
}

function TrackEvolutionLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-16 w-32" />
      </div>
      <Skeleton className="h-[350px] w-full" />
    </div>
  );
}
