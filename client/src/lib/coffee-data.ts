export const coffeeTypes = [
  { id: "espresso", name: "Espresso", description: "Bold & intense", caffeine: 150, calories: 5 },
  { id: "latte", name: "Latte", description: "Smooth & creamy", caffeine: 100, calories: 180 },
  { id: "cappuccino", name: "Cappuccino", description: "Rich & frothy", caffeine: 120, calories: 120 },
  { id: "americano", name: "Americano", description: "Simple & strong", caffeine: 120, calories: 10 },
  { id: "cold-brew", name: "Cold Brew", description: "Refreshing & smooth", caffeine: 200, calories: 5 },
  { id: "macchiato", name: "Macchiato", description: "Espresso marked with foam", caffeine: 140, calories: 80 },
  { id: "mocha", name: "Mocha", description: "Chocolate coffee indulgence", caffeine: 90, calories: 250 },
  { id: "frappuccino", name: "Frappuccino", description: "Blended iced coffee treat", caffeine: 95, calories: 240 },
  { id: "turkish-coffee", name: "Turkish Coffee", description: "Traditional unfiltered brew", caffeine: 160, calories: 8 },
  { id: "pour-over", name: "Pour Over", description: "Manual brewing precision", caffeine: 130, calories: 5 },
  { id: "french-press", name: "French Press", description: "Full immersion brewing", caffeine: 110, calories: 8 },
  { id: "aeropress", name: "AeroPress", description: "Pressure extraction method", caffeine: 125, calories: 5 }
];

export const milkTypes = [
  { id: "whole", name: "Whole Milk", calories: 60, protein: 3 },
  { id: "skim", name: "Skim Milk", calories: 35, protein: 3.5 },
  { id: "almond", name: "Almond Milk", calories: 20, protein: 1 },
  { id: "oat", name: "Oat Milk", calories: 45, protein: 1.5 },
  { id: "coconut", name: "Coconut Milk", calories: 35, protein: 0.5 },
  { id: "soy", name: "Soy Milk", calories: 40, protein: 3 },
  { id: "rice", name: "Rice Milk", calories: 50, protein: 0.5 },
  { id: "cashew", name: "Cashew Milk", calories: 25, protein: 1 },
  { id: "macadamia", name: "Macadamia Milk", calories: 25, protein: 1 },
  { id: "hemp", name: "Hemp Milk", calories: 30, protein: 2 },
  { id: "pea", name: "Pea Protein Milk", calories: 35, protein: 4 },
  { id: "lactose-free", name: "Lactose-Free Milk", calories: 50, protein: 3 }
];

export const toppings = [
  { id: "cinnamon", name: "Cinnamon", caffeine: 0, calories: 2 },
  { id: "cocoa-powder", name: "Cocoa Powder", caffeine: 2, calories: 10 },
  { id: "whipped-cream", name: "Whipped Cream", caffeine: 0, calories: 50 },
  { id: "vanilla-syrup", name: "Vanilla Syrup", caffeine: 0, calories: 30 },
  { id: "caramel-syrup", name: "Caramel Syrup", caffeine: 0, calories: 35 },
  { id: "hazelnut-syrup", name: "Hazelnut Syrup", caffeine: 0, calories: 30 },
  { id: "chocolate-chips", name: "Chocolate Chips", caffeine: 3, calories: 25 },
  { id: "marshmallows", name: "Marshmallows", caffeine: 0, calories: 40 },
  { id: "nutmeg", name: "Nutmeg", caffeine: 0, calories: 1 },
  { id: "cardamom", name: "Cardamom", caffeine: 0, calories: 2 },
  { id: "sea-salt", name: "Sea Salt", caffeine: 0, calories: 0 },
  { id: "coconut-flakes", name: "Coconut Flakes", caffeine: 0, calories: 15 },
  { id: "honey-drizzle", name: "Honey Drizzle", caffeine: 0, calories: 25 },
  { id: "maple-syrup", name: "Maple Syrup", caffeine: 0, calories: 35 },
  { id: "lavender", name: "Lavender", caffeine: 0, calories: 0 },
  { id: "espresso-powder", name: "Espresso Powder", caffeine: 25, calories: 5 }
];

export function calculateNutrition(
  coffeeType: string,
  milkType: string,
  sweetnessLevel: number,
  selectedToppings: string[]
) {
  const coffee = coffeeTypes.find(c => c.id === coffeeType) || coffeeTypes[0];
  const milk = milkTypes.find(m => m.id === milkType) || milkTypes[0];
  
  let calories = coffee.calories + milk.calories;
  let caffeine = coffee.caffeine;
  let protein = milk.protein;
  let sugar = sweetnessLevel * 4; // 4g sugar per teaspoon

  // Add sugar calories (4 calories per gram)
  calories += sugar * 4;

  // Add toppings
  selectedToppings.forEach(toppingId => {
    const topping = toppings.find(t => t.id === toppingId);
    if (topping) {
      calories += topping.calories;
      caffeine += topping.caffeine;
      // Add sugar from sweet toppings
      if (topping.id === 'vanilla-syrup' || topping.id === 'caramel-syrup' || 
          topping.id === 'hazelnut-syrup' || topping.id === 'honey-drizzle' || 
          topping.id === 'maple-syrup') {
        sugar += 8; // 8g sugar per syrup/sweetener topping
      }
      if (topping.id === 'marshmallows') {
        sugar += 6; // 6g sugar from marshmallows
      }
      if (topping.id === 'chocolate-chips') {
        sugar += 4; // 4g sugar from chocolate chips
      }
    }
  });

  return {
    calories: Math.round(calories),
    caffeine: Math.round(caffeine),
    protein: Math.round(protein * 10) / 10,
    sugar: Math.round(sugar)
  };
}
