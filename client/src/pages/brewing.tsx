import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, BookOpen, ChefHat } from "lucide-react";
import { BrewingMethod } from "@shared/schema";

export default function Brewing() {
  const { data: methods = [], isLoading } = useQuery<BrewingMethod[]>({
    queryKey: ["/api/brewing-methods"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading brewing guides...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Brewing Guides</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the art of coffee brewing with our step-by-step guides
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {methods.map((method) => (
            <Card key={method.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl font-bold text-primary">{method.name}</CardTitle>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {method.difficulty && (
                    <Badge variant="outline" className="text-xs">
                      <ChefHat className="w-3 h-3 mr-1" />
                      {method.difficulty}
                    </Badge>
                  )}
                  {method.brewTime && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {method.brewTime}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {method.description && (
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">{method.description}</p>
                )}

                {method.equipmentNeeded && method.equipmentNeeded.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Equipment Needed
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {method.equipmentNeeded.map((equipment, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Instructions</h4>
                  <ol className="space-y-2">
                    {method.steps.map((step, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-800 font-medium leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}