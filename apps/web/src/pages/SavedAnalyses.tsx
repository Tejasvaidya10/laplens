import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Trash2, ExternalLink, Calendar, Users } from 'lucide-react';

export function SavedAnalyses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      const data = await apiClient.getSavedAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    try {
      await apiClient.deleteSavedAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view saved analyses.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">No saved analyses yet.</p>
        <Button onClick={() => navigate('/')}>Create your first analysis</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Analyses</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader>
              <CardTitle className="text-lg">{analysis.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{analysis.season} - {analysis.eventName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{analysis.driverA} vs {analysis.driverB}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => navigate(`/?load=${analysis.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-1" /> Load
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(analysis.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
