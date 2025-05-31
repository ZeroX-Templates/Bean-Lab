import { 
  users, 
  coffeeRecipes, 
  coffeeLog, 
  brewingMethods,
  type User, 
  type InsertUser,
  type CoffeeRecipe,
  type InsertCoffeeRecipe,
  type CoffeeLogEntry,
  type InsertCoffeeLogEntry,
  type BrewingMethod,
  type InsertBrewingMethod
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCaffeineGoal(userId: number, goal: number): Promise<User | undefined>;

  // Coffee recipe methods
  getCoffeeRecipe(id: number): Promise<CoffeeRecipe | undefined>;
  getUserCoffeeRecipes(userId: number): Promise<CoffeeRecipe[]>;
  createCoffeeRecipe(recipe: InsertCoffeeRecipe): Promise<CoffeeRecipe>;
  updateCoffeeRecipe(id: number, recipe: Partial<InsertCoffeeRecipe>): Promise<CoffeeRecipe | undefined>;
  deleteCoffeeRecipe(id: number): Promise<boolean>;

  // Coffee log methods
  getCoffeeLogEntries(userId: number, date?: string): Promise<CoffeeLogEntry[]>;
  createCoffeeLogEntry(entry: InsertCoffeeLogEntry): Promise<CoffeeLogEntry>;
  getTodaysCaffeineIntake(userId: number): Promise<number>;
  getWeeklyStats(userId: number): Promise<{ avgCaffeine: number; totalCups: number; goalAdherence: number }>;

  // Brewing methods
  getAllBrewingMethods(): Promise<BrewingMethod[]>;
  getBrewingMethod(id: number): Promise<BrewingMethod | undefined>;
  createBrewingMethod(method: InsertBrewingMethod): Promise<BrewingMethod>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private coffeeRecipes: Map<number, CoffeeRecipe>;
  private coffeeLog: Map<number, CoffeeLogEntry>;
  private brewingMethods: Map<number, BrewingMethod>;
  private currentUserId: number;
  private currentRecipeId: number;
  private currentLogId: number;
  private currentMethodId: number;

  constructor() {
    this.users = new Map();
    this.coffeeRecipes = new Map();
    this.coffeeLog = new Map();
    this.brewingMethods = new Map();
    this.currentUserId = 1;
    this.currentRecipeId = 1;
    this.currentLogId = 1;
    this.currentMethodId = 1;

    this.seedData();
  }

  private seedData() {
    // Create a demo user
    const demoUser: User = {
      id: 1,
      username: "demo",
      password: "demo",
      dailyCaffeineGoal: 400,
      createdAt: new Date(),
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;

    // Seed brewing methods
    const brewingMethodsData = [
      {
        name: "Espresso",
        description: "Rich & bold concentrated coffee",
        steps: [
          "Grind 18-20g coffee beans to fine consistency",
          "Tamp grounds with 30lbs pressure",
          "Extract for 25-30 seconds",
          "Aim for 30-40ml output"
        ],
        equipmentNeeded: ["Espresso machine", "Coffee grinder", "Tamper"],
        brewTime: "25-30 seconds",
        difficulty: "Intermediate"
      },
      {
        name: "Pour Over",
        description: "Clean and bright manual brewing method",
        steps: [
          "Heat water to 200°F (93°C)",
          "Wet filter and add 22g medium-fine grounds",
          "Pour in circular motion, 4-minute total brew",
          "Start with 50g water for bloom, wait 30 seconds"
        ],
        equipmentNeeded: ["V60 dripper", "Paper filter", "Gooseneck kettle", "Scale"],
        brewTime: "4 minutes",
        difficulty: "Beginner"
      },
      {
        name: "French Press",
        description: "Full-bodied immersion brewing",
        steps: [
          "Add 30g coarse grounds to press",
          "Pour hot water (200°F), stir once",
          "Steep 4 minutes, press slowly",
          "Serve immediately"
        ],
        equipmentNeeded: ["French press", "Coffee grinder"],
        brewTime: "4 minutes",
        difficulty: "Beginner"
      }
    ];

    brewingMethodsData.forEach(method => {
      const id = this.currentMethodId++;
      this.brewingMethods.set(id, {
        id,
        ...method,
        steps: method.steps,
        equipmentNeeded: method.equipmentNeeded
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCaffeineGoal(userId: number, goal: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, dailyCaffeineGoal: goal };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Coffee recipe methods
  async getCoffeeRecipe(id: number): Promise<CoffeeRecipe | undefined> {
    return this.coffeeRecipes.get(id);
  }

  async getUserCoffeeRecipes(userId: number): Promise<CoffeeRecipe[]> {
    return Array.from(this.coffeeRecipes.values()).filter(recipe => recipe.userId === userId);
  }

  async createCoffeeRecipe(insertRecipe: InsertCoffeeRecipe): Promise<CoffeeRecipe> {
    const id = this.currentRecipeId++;
    const recipe: CoffeeRecipe = {
      ...insertRecipe,
      id,
      createdAt: new Date(),
    };
    this.coffeeRecipes.set(id, recipe);
    return recipe;
  }

  async updateCoffeeRecipe(id: number, updates: Partial<InsertCoffeeRecipe>): Promise<CoffeeRecipe | undefined> {
    const recipe = this.coffeeRecipes.get(id);
    if (!recipe) return undefined;
    
    const updatedRecipe = { ...recipe, ...updates };
    this.coffeeRecipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteCoffeeRecipe(id: number): Promise<boolean> {
    return this.coffeeRecipes.delete(id);
  }

  // Coffee log methods
  async getCoffeeLogEntries(userId: number, date?: string): Promise<CoffeeLogEntry[]> {
    const entries = Array.from(this.coffeeLog.values()).filter(entry => entry.userId === userId);
    
    if (date) {
      const targetDate = new Date(date);
      return entries.filter(entry => {
        const entryDate = entry.consumedAt || new Date();
        return entryDate.toDateString() === targetDate.toDateString();
      });
    }
    
    return entries;
  }

  async createCoffeeLogEntry(insertEntry: InsertCoffeeLogEntry): Promise<CoffeeLogEntry> {
    const id = this.currentLogId++;
    const entry: CoffeeLogEntry = {
      ...insertEntry,
      id,
      consumedAt: new Date(),
    };
    this.coffeeLog.set(id, entry);
    return entry;
  }

  async getTodaysCaffeineIntake(userId: number): Promise<number> {
    const today = new Date().toDateString();
    const todaysEntries = await this.getCoffeeLogEntries(userId, today);
    return todaysEntries.reduce((total, entry) => total + entry.caffeineAmount, 0);
  }

  async getWeeklyStats(userId: number): Promise<{ avgCaffeine: number; totalCups: number; goalAdherence: number }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEntries = Array.from(this.coffeeLog.values()).filter(entry => {
      if (entry.userId !== userId) return false;
      const entryDate = entry.consumedAt || new Date();
      return entryDate >= oneWeekAgo;
    });
    
    const totalCaffeine = weeklyEntries.reduce((total, entry) => total + entry.caffeineAmount, 0);
    const avgCaffeine = weeklyEntries.length > 0 ? Math.round(totalCaffeine / 7) : 0;
    const totalCups = weeklyEntries.length;
    
    // Calculate goal adherence (simplified)
    const user = await this.getUser(userId);
    const dailyGoal = user?.dailyCaffeineGoal || 400;
    const goalAdherence = Math.min(100, Math.round((avgCaffeine / dailyGoal) * 100));
    
    return { avgCaffeine, totalCups, goalAdherence };
  }

  // Brewing methods
  async getAllBrewingMethods(): Promise<BrewingMethod[]> {
    return Array.from(this.brewingMethods.values());
  }

  async getBrewingMethod(id: number): Promise<BrewingMethod | undefined> {
    return this.brewingMethods.get(id);
  }

  async createBrewingMethod(insertMethod: InsertBrewingMethod): Promise<BrewingMethod> {
    const id = this.currentMethodId++;
    const method: BrewingMethod = {
      ...insertMethod,
      id,
    };
    this.brewingMethods.set(id, method);
    return method;
  }
}

export const storage = new MemStorage();
