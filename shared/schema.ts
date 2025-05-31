import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  dailyCaffeineGoal: integer("daily_caffeine_goal").default(400),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coffeeRecipes = pgTable("coffee_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  coffeeType: text("coffee_type").notNull(),
  milkType: text("milk_type").notNull(),
  sweetnessLevel: integer("sweetness_level").notNull(),
  toppings: json("toppings").$type<string[]>().default([]),
  calories: integer("calories"),
  caffeine: integer("caffeine"),
  sugar: integer("sugar"),
  protein: integer("protein"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coffeeLog = pgTable("coffee_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  recipeId: integer("recipe_id").references(() => coffeeRecipes.id),
  caffeineAmount: integer("caffeine_amount").notNull(),
  calories: integer("calories").notNull(),
  consumedAt: timestamp("consumed_at").defaultNow(),
});

export const brewingMethods = pgTable("brewing_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  steps: json("steps").$type<string[]>().notNull(),
  equipmentNeeded: json("equipment_needed").$type<string[]>().default([]),
  brewTime: text("brew_time"),
  difficulty: text("difficulty"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  dailyCaffeineGoal: true,
});

export const insertCoffeeRecipeSchema = createInsertSchema(coffeeRecipes).omit({
  id: true,
  createdAt: true,
});

export const insertCoffeeLogSchema = createInsertSchema(coffeeLog).omit({
  id: true,
  consumedAt: true,
});

export const insertBrewingMethodSchema = createInsertSchema(brewingMethods).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CoffeeRecipe = typeof coffeeRecipes.$inferSelect;
export type InsertCoffeeRecipe = z.infer<typeof insertCoffeeRecipeSchema>;
export type CoffeeLogEntry = typeof coffeeLog.$inferSelect;
export type InsertCoffeeLogEntry = z.infer<typeof insertCoffeeLogSchema>;
export type BrewingMethod = typeof brewingMethods.$inferSelect;
export type InsertBrewingMethod = z.infer<typeof insertBrewingMethodSchema>;
