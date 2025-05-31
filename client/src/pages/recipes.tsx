import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Coffee, Trash2, Plus } from "lucide-react";
import { CoffeeRecipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Recipes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your recipes.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<CoffeeRecipe[]>({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/recipes/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe Deleted",
        description: "Your coffee recipe has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      await apiRequest(`/api/recipes/${id}`, {
        method: "PUT",
        body: { isFavorite: !isFavorite },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  if (isLoading || recipesLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Your Coffee Recipes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage and organize all your favorite coffee creations
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Recipes Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating your perfect coffee recipes to see them here
            </p>
            <Button onClick={() => window.location.href = "/#customize"} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-primary">{recipe.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavoriteMutation.mutate({ id: recipe.id, isFavorite: recipe.isFavorite || false })}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Coffee Type:</span>
                      <span className="text-gray-900 font-semibold">{recipe.coffeeType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Milk:</span>
                      <span className="text-gray-900 font-semibold">{recipe.milkType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Sweetness:</span>
                      <span className="text-gray-900 font-semibold">{recipe.sweetnessLevel}/5</span>
                    </div>
                  </div>

                  {recipe.toppings && recipe.toppings.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-2">Toppings:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.toppings.map((topping, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topping}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-2 bg-accent rounded">
                      <div className="text-sm font-semibold text-primary">{recipe.calories || 0}</div>
                      <div className="text-xs text-gray-600 font-medium">Calories</div>
                    </div>
                    <div className="text-center p-2 bg-accent rounded">
                      <div className="text-sm font-semibold text-primary">{recipe.caffeine || 0}mg</div>
                      <div className="text-xs text-gray-600 font-medium">Caffeine</div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(recipe.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Brew Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}