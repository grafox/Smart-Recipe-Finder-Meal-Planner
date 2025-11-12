import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MealDBResponse, Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  searchRecipes(query: string): Observable<Recipe[]> {
    if (!query.trim()) {
      return of([]);
    }
    return this.http.get<MealDBResponse>(`${this.baseUrl}/search.php?s=${query}`).pipe(
      map(response => response.meals || []),
      catchError(() => of([]))
    );
  }

  getRecipeById(id: string): Observable<Recipe | null> {
    return this.http.get<MealDBResponse>(`${this.baseUrl}/lookup.php?i=${id}`).pipe(
      map(response => (response.meals && response.meals.length > 0) ? response.meals[0] : null),
      catchError(() => of(null))
    );
  }

  getRandomRecipe(): Observable<Recipe | null> {
    return this.http.get<MealDBResponse>(`${this.baseUrl}/random.php`).pipe(
      map(response => (response.meals && response.meals.length > 0) ? response.meals[0] : null),
      catchError(() => of(null))
    );
  }
}
