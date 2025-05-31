import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { coffeeTypes, milkTypes, toppings, calculateNutrition } from "@/lib/coffee-data";
import { apiRequest } from "@/lib/queryClient";
import type { InsertCoffeeRecipe } from "@shared/schema";

export function CoffeeCustomizer() {
  const [selectedType, setSelectedType] = useState("espresso");
  const [selectedMilk, setSelectedMilk] = useState("whole");
  const [sweetnessLevel, setSweetnessLevel] = useState([2]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [recipeName, setRecipeName] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const nutrition = calculateNutrition(selectedType, selectedMilk, sweetnessLevel[0], selectedToppings);
  
  const selectedCoffee = coffeeTypes.find(c => c.id === selectedType);
  const selectedMilkType = milkTypes.find(m => m.id === selectedMilk);

  useEffect(() => {
    const coffee = coffeeTypes.find(c => c.id === selectedType);
    const milk = milkTypes.find(m => m.id === selectedMilk);
    if (coffee && milk) {
      setRecipeName(`Custom ${coffee.name}`);
    }
  }, [selectedType, selectedMilk]);

  const createRecipeMutation = useMutation({
    mutationFn: async (recipe: InsertCoffeeRecipe) => {
      const response = await apiRequest("POST", "/api/recipes", recipe);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recipe Created!",
        description: "Your custom coffee recipe has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToppingChange = (toppingId: string, checked: boolean) => {
    if (checked) {
      setSelectedToppings([...selectedToppings, toppingId]);
    } else {
      setSelectedToppings(selectedToppings.filter(id => id !== toppingId));
    }
  };

  const handleCreateRecipe = () => {
    const recipe: InsertCoffeeRecipe = {
      userId: 1, // Mock user ID
      name: recipeName,
      coffeeType: selectedType,
      milkType: selectedMilk,
      sweetnessLevel: sweetnessLevel[0],
      toppings: selectedToppings,
      calories: nutrition.calories,
      caffeine: nutrition.caffeine,
      sugar: nutrition.sugar,
      protein: nutrition.protein,
      isFavorite: false,
    };

    createRecipeMutation.mutate(recipe);
  };

  return (
    <section id="customize" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Build Your Perfect Cup
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customize every aspect of your coffee with 12 types, 12 milk options, and endless combinations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Coffee Builder Interface */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">
                Customize Your Coffee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Coffee Type Selection */}
              <div>
                <Label className="text-lg font-semibold text-foreground mb-4 block">
                  Coffee Type
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {coffeeTypes.map((coffee) => (
                    <button
                      key={coffee.id}
                      onClick={() => setSelectedType(coffee.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedType === coffee.id
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="font-semibold text-primary">{coffee.name}</div>
                      <div className="text-sm text-muted-foreground">{coffee.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Selection */}
              <div>
                <Label className="text-lg font-semibold text-foreground mb-4 block">
                  Milk Choice
                </Label>
                <Select value={selectedMilk} onValueChange={setSelectedMilk}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {milkTypes.map((milk) => (
                      <SelectItem key={milk.id} value={milk.id}>
                        {milk.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sweetness Level */}
              <div>
                <Label className="text-lg font-semibold text-foreground mb-4 block">
                  Sweetness Level
                </Label>
                <div className="px-4">
                  <Slider
                    value={sweetnessLevel}
                    onValueChange={setSweetnessLevel}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>No Sugar</span>
                    <span>Very Sweet</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-primary font-medium">
                    {sweetnessLevel[0] === 0 ? "No Sugar" : 
                     sweetnessLevel[0] === 1 ? "1 teaspoon" :
                     `${sweetnessLevel[0]} teaspoons`}
                  </span>
                </div>
              </div>

              {/* Toppings */}
              <div>
                <Label className="text-lg font-semibold text-foreground mb-4 block">
                  Toppings
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {toppings.map((topping) => (
                    <div key={topping.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
                      <Checkbox
                        id={topping.id}
                        checked={selectedToppings.includes(topping.id)}
                        onCheckedChange={(checked) => 
                          handleToppingChange(topping.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={topping.id} className="text-sm cursor-pointer">
                        {topping.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateRecipe}
                disabled={createRecipeMutation.isPending}
              >
                {createRecipeMutation.isPending ? "Creating..." : "Create Recipe"}
              </Button>
            </CardContent>
          </Card>

          {/* Preview & Nutrition */}
          <div className="space-y-6">
            {/* Coffee Preview */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-primary mb-4">Your Coffee Preview</h3>
                <div className="text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Coffee preview" 
                    className="w-48 h-48 object-cover rounded-full mx-auto mb-4" 
                  />
                  <h4 className="text-2xl font-bold text-primary mb-2">
                    {recipeName}
                  </h4>
                  <p className="text-muted-foreground">
                    {selectedCoffee?.description} with {selectedMilkType?.name.toLowerCase()}, 
                    {sweetnessLevel[0] === 0 ? " no" : sweetnessLevel[0] === 1 ? " light" : 
                     sweetnessLevel[0] <= 3 ? " medium" : " high"} sweetness
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Info */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-primary mb-4">Nutrition Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-accent rounded-xl">
                    <div className="text-2xl font-bold text-primary">{nutrition.calories}</div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-xl">
                    <div className="text-2xl font-bold text-primary">{nutrition.caffeine}mg</div>
                    <div className="text-sm text-muted-foreground">Caffeine</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-xl">
                    <div className="text-2xl font-bold text-primary">{nutrition.sugar}g</div>
                    <div className="text-sm text-muted-foreground">Sugar</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-xl">
                    <div className="text-2xl font-bold text-primary">{nutrition.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
