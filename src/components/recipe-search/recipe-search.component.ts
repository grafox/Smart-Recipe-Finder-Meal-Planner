import { Component, ChangeDetectionStrategy, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { PlannerService, Day } from '../../services/planner.service';
import { FavoritesService } from '../../services/favorites.service';
import { NotificationService } from '../../services/notification.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipe-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeSearchComponent {
  recipeService = inject(RecipeService);
  plannerService = inject(PlannerService);
  favoritesService = inject(FavoritesService);
  notificationService = inject(NotificationService);

  searchQuery = signal('');
  recipes: WritableSignal<Recipe[]> = signal([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // For the 'Add to Plan' modal
  isModalOpen = signal(false);
  selectedRecipeForPlanning: WritableSignal<Recipe | null> = signal(null);
  selectedDay: WritableSignal<Day> = signal('Monday');
  
  daysOfWeek = this.plannerService.daysOfWeek;

  search(): void {
    if (!this.searchQuery().trim()) return;
    this.isLoading.set(true);
    this.error.set(null);
    this.recipeService.searchRecipes(this.searchQuery()).subscribe({
      next: (data) => {
        this.recipes.set(data);
        if (data.length === 0) {
          this.error.set('No recipes found. Try a different search term!');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not fetch recipes. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  getRandom(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.recipeService.getRandomRecipe().subscribe({
        next: (recipe) => {
            this.recipes.set(recipe ? [recipe] : []);
            if (!recipe) {
                this.error.set('Could not fetch a random recipe. Please try again.');
            }
            this.isLoading.set(false);
        },
        error: () => {
            this.error.set('An error occurred. Please try again later.');
            this.isLoading.set(false);
        }
    })
  }

  toggleFavorite(recipe: Recipe, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(recipe);
    const isFav = this.favoritesService.isFavorite(recipe.idMeal);
    this.notificationService.show(
      isFav ? `Added "${recipe.strMeal}" to favorites.` : `Removed "${recipe.strMeal}" from favorites.`,
      'success'
    );
  }
  
  isFavorite(recipe: Recipe): boolean {
    return this.favoritesService.isFavorite(recipe.idMeal);
  }

  openAddToPlanModal(recipe: Recipe, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedRecipeForPlanning.set(recipe);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedRecipeForPlanning.set(null);
  }

  confirmAddToPlan(): void {
    const recipe = this.selectedRecipeForPlanning();
    const day = this.selectedDay();
    if (recipe && day) {
      this.plannerService.addRecipeToDay(day, recipe);
      this.notificationService.show(`Added "${recipe.strMeal}" to ${day}.`, 'success');
      this.closeModal();
    }
  }
}
