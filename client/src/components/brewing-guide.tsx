import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BrewingMethod } from "@shared/schema";

export function BrewingGuide() {
  const { data: brewingMethods, isLoading } = useQuery<BrewingMethod[]>({
    queryKey: ["/api/brewing-methods"],
  });

  const getImageForMethod = (name: string) => {
    switch (name.toLowerCase()) {
      case "espresso":
        return "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      case "pour over":
        return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      case "french press":
        return "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      default:
        return "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
    }
  };

  if (isLoading) {
    return (
      <section id="brewing" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold coffee-brown mb-4">
              Master the Art of Brewing
            </h2>
            <p className="text-lg coffee-grey max-w-2xl mx-auto">
              Step-by-step instructions for perfect coffee every time
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-start space-x-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="brewing" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold coffee-brown mb-4">
            Master the Art of Brewing
          </h2>
          <p className="text-lg coffee-grey max-w-2xl mx-auto">
            Step-by-step instructions for perfect coffee every time
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brewingMethods?.map((method) => (
            <Card key={method.id} className="shadow-lg overflow-hidden">
              <img 
                src={getImageForMethod(method.name)} 
                alt={`${method.name} brewing equipment`} 
                className="w-full h-48 object-cover" 
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-bold coffee-brown mb-3">{method.name}</h3>
                <p className="text-sm coffee-grey mb-4">{method.description}</p>
                
                <div className="space-y-3 mb-4">
                  {method.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-coffee-brown text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="text-sm coffee-grey">{step}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs coffee-grey mb-4">
                  <span>⏱️ {method.brewTime}</span>
                  <span>📊 {method.difficulty}</span>
                </div>

                <Button variant="link" className="coffee-brown p-0 h-auto">
                  View full guide →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
