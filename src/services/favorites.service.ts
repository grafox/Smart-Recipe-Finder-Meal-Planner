import { Injectable, signal, effect, computed } from '@angular/core';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly storageKey = 'favorite-recipes';
  
  favoriteIds = signal<string[]>(this.loadFavorites());

  constructor() {
    effect(() => {
      this.saveFavorites(this.favoriteIds());
    });
  }

  private loadFavorites(): string[] {
    try {
      const storedFavorites = localStorage.getItem(this.storageKey);
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (e) {
      console.error('Error reading favorites from localStorage', e);
      return [];
    }
  }

  private saveFavorites(ids: string[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(ids));
    } catch (e) {
      console.error('Error saving favorites to localStorage', e);
    }
  }

  isFavorite(recipeId: string): boolean {
    return this.favoriteIds().includes(recipeId);
  }

  toggleFavorite(recipe: Recipe) {
    if (this.isFavorite(recipe.idMeal)) {
      this.favoriteIds.update(ids => ids.filter(id => id !== recipe.idMeal));
    } else {
      this.favoriteIds.update(ids => [...ids, recipe.idMeal]);
    }
  }

  getFavorites(): string[] {
    return this.favoriteIds();
  }
}
