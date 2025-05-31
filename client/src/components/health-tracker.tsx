import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, Coffee, Target, TrendingUp, Calendar, Heart, Activity, Brain, Zap, Clock, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { coffeeTypes } from "@/lib/coffee-data";
import type { InsertCoffeeLogEntry, CoffeeLogEntry } from "@shared/schema";

interface HealthStats {
  todaysCaffeine: number;
  dailyGoal: number;
  avgCaffeine: number;
  totalCups: number;
  goalAdherence: number;
}

export function HealthTracker() {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [newLogEntry, setNewLogEntry] = useState({
    recipeId: null,
    caffeineAmount: "",
    calories: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthStats, isLoading: statsLoading } = useQuery<HealthStats>({
    queryKey: ["/api/health-stats"],
  });

  const { data: todaysLog, isLoading: logLoading } = useQuery<CoffeeLogEntry[]>({
    queryKey: ["/api/coffee-log", { date: new Date().toISOString().split('T')[0] }],
  });

  const logCoffeeMutation = useMutation({
    mutationFn: async (entry: InsertCoffeeLogEntry) => {
      const response = await apiRequest("POST", "/api/coffee-log", entry);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coffee Logged!",
        description: "Your coffee consumption has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health-stats"] });
      setIsLogDialogOpen(false);
      setNewLogEntry({ recipeId: null, caffeineAmount: "", calories: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log coffee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogCoffee = () => {
    if (!newLogEntry.caffeineAmount || !newLogEntry.calories) {
      toast({
        title: "Missing Information",
        description: "Please fill in caffeine and calorie amounts.",
        variant: "destructive",
      });
      return;
    }

    const entry: InsertCoffeeLogEntry = {
      userId: 1, // Mock user ID
      recipeId: newLogEntry.recipeId,
      caffeineAmount: parseInt(newLogEntry.caffeineAmount),
      calories: parseInt(newLogEntry.calories),
    };

    logCoffeeMutation.mutate(entry);
  };

  const progressPercentage = healthStats 
    ? Math.min(100, (healthStats.todaysCaffeine / healthStats.dailyGoal) * 100)
    : 0;

  if (statsLoading) {
    return (
      <section id="tracking" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold coffee-brown mb-4">
              Track Your Coffee Health
            </h2>
            <p className="text-lg coffee-grey max-w-2xl mx-auto">
              Monitor your caffeine intake and stay within your personalized health goals
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tracking" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold coffee-brown mb-4">
            Track Your Coffee Health
          </h2>
          <p className="text-lg coffee-grey max-w-2xl mx-auto">
            Monitor your caffeine intake and stay within your personalized health goals
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Progress */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold coffee-brown flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Caffeine Goal Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold coffee-grey">Caffeine Goal</span>
                  <span className="coffee-brown font-bold">
                    {healthStats?.todaysCaffeine || 0}mg / {healthStats?.dailyGoal || 400}mg
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-sm coffee-grey mt-2">
                  {Math.round(progressPercentage)}% of daily goal reached
                </p>
              </div>

              {/* Coffee Log */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold coffee-grey">Coffee Log</h4>
                  <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-coffee-brown text-coffee-brown hover:bg-coffee-brown hover:text-white">
                        Log New Coffee
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Coffee Consumption</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="coffee-type">Coffee Type (Optional)</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select coffee type" />
                            </SelectTrigger>
                            <SelectContent>
                              {coffeeTypes.map((coffee) => (
                                <SelectItem key={coffee.id} value={coffee.id}>
                                  {coffee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="caffeine">Caffeine Amount (mg)</Label>
                          <Input
                            id="caffeine"
                            type="number"
                            value={newLogEntry.caffeineAmount}
                            onChange={(e) => setNewLogEntry({ ...newLogEntry, caffeineAmount: e.target.value })}
                            placeholder="e.g., 150"
                          />
                        </div>
                        <div>
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={newLogEntry.calories}
                            onChange={(e) => setNewLogEntry({ ...newLogEntry, calories: e.target.value })}
                            placeholder="e.g., 120"
                          />
                        </div>
                        <Button 
                          onClick={handleLogCoffee}
                          disabled={logCoffeeMutation.isPending}
                          className="w-full bg-coffee-brown hover:bg-coffee-brown/90"
                        >
                          {logCoffeeMutation.isPending ? "Logging..." : "Log Coffee"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-3">
                  {logLoading ? (
                    [1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-coffee-wheat/20 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))
                  ) : todaysLog && todaysLog.length > 0 ? (
                    todaysLog.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-coffee-wheat/20 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-coffee-brown rounded-full flex items-center justify-center">
                            <Coffee className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold coffee-brown">Coffee Entry</div>
                            <div className="text-sm coffee-grey">
                              {entry.consumedAt ? new Date(entry.consumedAt).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              }) : 'Just now'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold coffee-brown">{entry.caffeineAmount}mg</div>
                          <div className="text-sm coffee-grey">{entry.calories} cal</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 coffee-grey">
                      <Coffee className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No coffee logged today. Start by logging your first cup!</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Stats Sidebar */}
          <div className="space-y-6">
            {/* Weekly Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold coffee-brown flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="coffee-grey">Avg Daily Caffeine</span>
                  <span className="font-bold coffee-brown">{healthStats?.avgCaffeine || 0}mg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="coffee-grey">Cups This Week</span>
                  <span className="font-bold coffee-brown">{healthStats?.totalCups || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="coffee-grey">Goal Adherence</span>
                  <span className="font-bold text-green-600">{healthStats?.goalAdherence || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Health Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Health Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-accent rounded-xl text-center">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-foreground">Heart Rate</div>
                    <div className="text-xs text-muted-foreground">Impact: Minimal</div>
                  </div>
                  <div className="p-3 bg-accent rounded-xl text-center">
                    <Brain className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-foreground">Focus</div>
                    <div className="text-xs text-muted-foreground">Enhanced</div>
                  </div>
                  <div className="p-3 bg-accent rounded-xl text-center">
                    <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-foreground">Energy</div>
                    <div className="text-xs text-muted-foreground">Optimal</div>
                  </div>
                  <div className="p-3 bg-accent rounded-xl text-center">
                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-foreground">Sleep</div>
                    <div className="text-xs text-muted-foreground">Good timing</div>
                  </div>
                </div>
                
                {healthStats && (
                  <div className="space-y-3">
                    {healthStats.todaysCaffeine < healthStats.dailyGoal * 0.5 && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Room for More</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          You're well within your caffeine limit. Consider a mid-afternoon pick-me-up!
                        </p>
                      </div>
                    )}
                    
                    {healthStats.todaysCaffeine > healthStats.dailyGoal * 0.8 && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-amber-800">Approaching Limit</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          You're close to your daily goal. Consider switching to decaf for your next cup.
                        </p>
                      </div>
                    )}
                    
                    {healthStats.goalAdherence >= 80 && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Excellent Consistency!</span>
                        </div>
                        <p className="text-sm text-green-700">
                          You're maintaining great caffeine habits. Keep up the balanced approach!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-accent text-foreground">
                  <div className="text-left">
                    <div className="font-semibold text-primary">Set New Goal</div>
                    <div className="text-sm text-muted-foreground">Adjust your daily caffeine target</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-accent text-foreground">
                  <div className="text-left">
                    <div className="font-semibold text-primary">View Trends</div>
                    <div className="text-sm text-muted-foreground">Analyze your coffee patterns</div>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-accent text-foreground">
                  <div className="text-left">
                    <div className="font-semibold text-primary">Recipe History</div>
                    <div className="text-sm text-muted-foreground">Review your favorite brews</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
