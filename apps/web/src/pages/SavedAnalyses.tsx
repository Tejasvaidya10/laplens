import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useSessionStore } from '@/hooks/use-session-store';
import { useToast } from '@/hooks/use-toast';
import { SavedAnalysis } from '@/types';
import {
  Bookmark,
  Calendar,
  Trash2,
  ExternalLink,
  Loader2,
  LogIn,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/dialog';

export function SavedAnalyses() {
  const { session: authSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setStore = useSessionStore((state) => ({
    setSeason: state.setSeason,
    setEvent: state.setEvent,
    setSession: state.setSession,
    setDriverA: state.setDriverA,
    setDriverB: state.setDriverB,
    setLapA: state.setLapA,
    setLapB: state.setLapB,
  }));

  const {
    data: analyses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['savedAnalyses'],
    queryFn: () => apiClient.getSavedAnalyses(),
    enabled: !!authSession,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteSavedAnalysis(id),
    onSuccess: () => {
      toast({
        title: 'Analysis deleted',
        description: 'The analysis has been removed from your saved list.',
      });
      queryClient.invalidateQueries({ queryKey: ['savedAnalyses'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete analysis. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    setStore.setSeason(analysis.season);
    setStore.setEvent(analysis.event);
    setStore.setSession(analysis.session);
    setStore.setDriverA(analysis.driver_a);
    setStore.setDriverB(analysis.driver_b);
    if (analysis.lap_a) setStore.setLapA(analysis.lap_a);
    if (analysis.lap_b) setStore.setLapB(analysis.lap_b);
    navigate('/');
  };

  // Not logged in
  if (!authSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <LogIn className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to be signed in to view and manage your saved analyses.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Analyses</h1>
          <p className="text-muted-foreground">Your saved telemetry comparisons</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Error Loading Analyses</h2>
        <p className="text-muted-foreground max-w-md">
          There was an error loading your saved analyses. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Analyses</h1>
        <p className="text-muted-foreground">Your saved telemetry comparisons</p>
      </div>

      {analyses && analyses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="group relative">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="truncate pr-2">{analysis.name}</span>
                  <Bookmark className="w-5 h-5 text-primary shrink-0" />
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(analysis.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Season:</span>{' '}
                    {analysis.season}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Event:</span>{' '}
                    {analysis.event}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Session:</span>{' '}
                    {analysis.session}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Drivers:</span>{' '}
                    {analysis.driver_a} vs {analysis.driver_b}
                  </p>
                  {(analysis.lap_a || analysis.lap_b) && (
                    <p>
                      <span className="text-muted-foreground">Laps:</span>{' '}
                      {analysis.lap_a ?? 'Best'} vs {analysis.lap_b ?? 'Best'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleLoadAnalysis(analysis)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{analysis.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(analysis.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Delete'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Saved Analyses</p>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't saved any analyses yet. Compare drivers and click "Save
              Analysis" to save comparisons for later.
            </p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Start Comparing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
