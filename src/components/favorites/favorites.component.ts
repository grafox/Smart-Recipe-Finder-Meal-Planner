import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { FavoritesService } from '../../services/favorites.service';
import { RecipeService } from '../../services/recipe.service';
import { NotificationService } from '../../services/notification.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  favoritesService = inject(FavoritesService);
  recipeService = inject(RecipeService);
  notificationService = inject(NotificationService);

  favoriteRecipes = signal<Recipe[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    const favoriteIds = this.favoritesService.getFavorites();

    if (favoriteIds.length === 0) {
      this.favoriteRecipes.set([]);
      this.isLoading.set(false);
      return;
    }

    const recipeObservables = favoriteIds.map(id => this.recipeService.getRecipeById(id));
    
    forkJoin(recipeObservables).subscribe({
      next: (recipes) => {
        this.favoriteRecipes.set(recipes.filter(Boolean) as Recipe[]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.show('Could not load favorite recipes.', 'error');
      }
    });
  }

  unfavorite(recipe: Recipe, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(recipe);
    this.favoriteRecipes.update(recipes => recipes.filter(r => r.idMeal !== recipe.idMeal));
    this.notificationService.show(`"${recipe.strMeal}" removed from favorites.`, 'success');
  }
}
