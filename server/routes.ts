import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCoffeeRecipeSchema, insertCoffeeLogSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session storage
  const sessions = new Map<string, { userId: number; expires: number }>();

  // Middleware to get current user
  const getCurrentUser = async (req: any) => {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return null;

    const session = sessions.get(sessionId);
    if (!session || session.expires < Date.now()) {
      sessions.delete(sessionId);
      return null;
    }

    return await storage.getUser(session.userId);
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ id: user.id, username: user.username, dailyCaffeineGoal: user.dailyCaffeineGoal });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = Math.random().toString(36).substring(2);
      const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      sessions.set(sessionId, { userId: user.id, expires });

      res.cookie('sessionId', sessionId, { 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
      
      res.json({ id: user.id, username: user.username, dailyCaffeineGoal: user.dailyCaffeineGoal });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json({ id: user.id, username: user.username, dailyCaffeineGoal: user.dailyCaffeineGoal });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie('sessionId');
    res.json({ message: "Logged out successfully" });
  });

  // Coffee recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const recipes = await storage.getUserCoffeeRecipes(userId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const recipeData = insertCoffeeRecipeSchema.parse({ ...req.body, userId });
      const recipe = await storage.createCoffeeRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      res.status(400).json({ message: "Invalid recipe data" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCoffeeRecipeSchema.partial().parse(req.body);
      const recipe = await storage.updateCoffeeRecipe(id, updates);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(400).json({ message: "Invalid recipe data" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCoffeeRecipe(id);
      
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Coffee log
  app.get("/api/coffee-log", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const date = req.query.date as string;
      const entries = await storage.getCoffeeLogEntries(userId, date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coffee log" });
    }
  });

  app.post("/api/coffee-log", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const entryData = insertCoffeeLogSchema.parse({ ...req.body, userId });
      const entry = await storage.createCoffeeLogEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid log entry data" });
    }
  });

  // Health stats
  app.get("/api/health-stats", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const todaysCaffeine = await storage.getTodaysCaffeineIntake(userId);
      const weeklyStats = await storage.getWeeklyStats(userId);
      const user = await storage.getUser(userId) || { dailyCaffeineGoal: 400 };
      
      res.json({
        todaysCaffeine,
        dailyGoal: user.dailyCaffeineGoal,
        ...weeklyStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health stats" });
    }
  });

  // Brewing methods
  app.get("/api/brewing-methods", async (req, res) => {
    try {
      const methods = await storage.getAllBrewingMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brewing methods" });
    }
  });

  app.get("/api/brewing-methods/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const method = await storage.getBrewingMethod(id);
      
      if (!method) {
        return res.status(404).json({ message: "Brewing method not found" });
      }
      
      res.json(method);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brewing method" });
    }
  });

  // Update caffeine goal
  app.put("/api/caffeine-goal", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const { goal } = z.object({ goal: z.number().min(0).max(1000) }).parse(req.body);
      const user = await storage.updateUserCaffeineGoal(userId, goal);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ dailyCaffeineGoal: user.dailyCaffeineGoal });
    } catch (error) {
      res.status(400).json({ message: "Invalid goal value" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
