export const coffeeTypes = [
  { id: "espresso", name: "Espresso", description: "Rich & Bold", caffeine: 150, calories: 5 },
  { id: "americano", name: "Americano", description: "Smooth & Clean", caffeine: 120, calories: 10 },
  { id: "latte", name: "Latte", description: "Creamy & Mild", caffeine: 100, calories: 180 },
  { id: "cappuccino", name: "Cappuccino", description: "Frothy & Balanced", caffeine: 120, calories: 120 },
  { id: "macchiato", name: "Macchiato", description: "Intense & Layered", caffeine: 140, calories: 80 },
  { id: "mocha", name: "Mocha", description: "Sweet & Chocolatey", caffeine: 90, calories: 250 },
  { id: "flat-white", name: "Flat White", description: "Velvety & Strong", caffeine: 130, calories: 155 },
  { id: "cortado", name: "Cortado", description: "Balanced & Smooth", caffeine: 125, calories: 90 },
  { id: "gibraltar", name: "Gibraltar", description: "Small & Intense", caffeine: 140, calories: 70 },
  { id: "lungo", name: "Lungo", description: "Extended & Mild", caffeine: 180, calories: 8 },
  { id: "ristretto", name: "Ristretto", description: "Short & Concentrated", caffeine: 130, calories: 3 },
  { id: "affogato", name: "Affogato", description: "Coffee & Ice Cream", caffeine: 100, calories: 300 }
];

export const milkTypes = [
  { id: "whole", name: "Whole Milk", calories: 60, protein: 3 },
  { id: "skim", name: "Skim Milk", calories: 35, protein: 3.5 },
  { id: "2percent", name: "2% Milk", calories: 50, protein: 3.2 },
  { id: "oat", name: "Oat Milk", calories: 45, protein: 1.5 },
  { id: "almond", name: "Almond Milk", calories: 20, protein: 1 },
  { id: "soy", name: "Soy Milk", calories: 40, protein: 3 },
  { id: "coconut", name: "Coconut Milk", calories: 35, protein: 0.5 },
  { id: "rice", name: "Rice Milk", calories: 50, protein: 0.5 },
  { id: "hemp", name: "Hemp Milk", calories: 30, protein: 2 },
  { id: "pea", name: "Pea Milk", calories: 35, protein: 4 },
  { id: "macadamia", name: "Macadamia Milk", calories: 25, protein: 1 },
  { id: "cashew", name: "Cashew Milk", calories: 25, protein: 1 }
];

export const toppings = [
  { id: "extra-shot", name: "Extra Shot", caffeine: 75, calories: 5 },
  { id: "whipped-cream", name: "Whipped Cream", caffeine: 0, calories: 50 },
  { id: "vanilla-syrup", name: "Vanilla Syrup", caffeine: 0, calories: 30 },
  { id: "caramel-syrup", name: "Caramel Syrup", caffeine: 0, calories: 35 },
  { id: "hazelnut-syrup", name: "Hazelnut Syrup", caffeine: 0, calories: 30 },
  { id: "cinnamon", name: "Cinnamon", caffeine: 0, calories: 2 },
  { id: "nutmeg", name: "Nutmeg", caffeine: 0, calories: 1 },
  { id: "cocoa-powder", name: "Cocoa Powder", caffeine: 2, calories: 10 },
  { id: "chocolate-shavings", name: "Chocolate Shavings", caffeine: 3, calories: 25 },
  { id: "marshmallows", name: "Marshmallows", caffeine: 0, calories: 40 },
  { id: "honey", name: "Honey", caffeine: 0, calories: 25 },
  { id: "agave", name: "Agave Syrup", caffeine: 0, calories: 20 },
  { id: "stevia", name: "Stevia", caffeine: 0, calories: 0 },
  { id: "brown-sugar", name: "Brown Sugar", caffeine: 0, calories: 15 },
  { id: "maple-syrup", name: "Maple Syrup", caffeine: 0, calories: 35 },
  { id: "sea-salt", name: "Sea Salt", caffeine: 0, calories: 0 }
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
    }
  });

  return {
    calories: Math.round(calories),
    caffeine: Math.round(caffeine),
    protein: Math.round(protein * 10) / 10,
    sugar: Math.round(sugar)
  };
}
