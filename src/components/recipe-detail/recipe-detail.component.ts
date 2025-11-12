import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, Ingredient } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  recipeService = inject(RecipeService);

  recipe = signal<Recipe | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ingredients = computed<Ingredient[]>(() => {
    const currentRecipe = this.recipe();
    if (!currentRecipe) return [];

    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = currentRecipe[`strIngredient${i}` as keyof Recipe] as string;
      const measure = currentRecipe[`strMeasure${i}` as keyof Recipe] as string;
      if (ingredient) {
        ingredients.push({ name: ingredient, measure });
      }
    }
    return ingredients;
  });

  youtubeVideoId = computed<string | null>(() => {
    const youtubeLink = this.recipe()?.strYoutube;
    if (!youtubeLink) return null;

    try {
      // Regular expression to find the video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = youtubeLink.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      console.error('Error parsing YouTube URL', e);
      return null;
    }
  });

  youtubeThumbnailUrl = computed<string | null>(() => {
    const videoId = this.youtubeVideoId();
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  });
  
  // Mocked nutrition data
  nutritionData = computed(() => {
      const ingCount = this.ingredients().length;
      if (ingCount === 0) return null;
      return {
          calories: (ingCount * 50 + Math.floor(Math.random() * 200)),
          protein: (ingCount * 5 + Math.floor(Math.random() * 10)),
          carbs: (ingCount * 8 + Math.floor(Math.random() * 15)),
          fat: (ingCount * 4 + Math.floor(Math.random() * 12)),
      }
  });


  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading.set(true);
          return this.recipeService.getRecipeById(id);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.recipe.set(data);
        } else {
          this.error.set('Recipe not found.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not fetch recipe details.');
        this.isLoading.set(false);
      }
    });
  }
}