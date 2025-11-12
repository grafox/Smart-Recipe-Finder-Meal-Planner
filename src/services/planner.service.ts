import { Injectable, signal, computed, effect } from '@angular/core';
import { Recipe } from '../models/recipe.model';

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type MealPlan = Record<Day, Recipe | null>;

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly storageKey = 'meal-plan';
  
  daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  plan = signal<MealPlan>(this.loadPlan());

  constructor() {
    effect(() => {
      this.savePlan(this.plan());
    });
  }

  private loadPlan(): MealPlan {
    try {
      const storedPlan = localStorage.getItem(this.storageKey);
      if (storedPlan) {
        return JSON.parse(storedPlan);
      }
    } catch (e) {
      console.error('Error reading meal plan from localStorage', e);
    }
    return this.getEmptyPlan();
  }

  private savePlan(plan: MealPlan) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(plan));
    } catch (e) {
      console.error('Error saving meal plan to localStorage', e);
    }
  }

  getEmptyPlan(): MealPlan {
    return {
      Monday: null, Tuesday: null, Wednesday: null, Thursday: null,
      Friday: null, Saturday: null, Sunday: null
    };
  }
  
  addRecipeToDay(day: Day, recipe: Recipe) {
    this.plan.update(currentPlan => ({ ...currentPlan, [day]: recipe }));
  }

  removeRecipeFromDay(day: Day) {
    this.plan.update(currentPlan => ({ ...currentPlan, [day]: null }));
  }

  clearPlan() {
    this.plan.set(this.getEmptyPlan());
  }
  
  updatePlan(newPlan: MealPlan) {
    this.plan.set(newPlan);
  }
}
