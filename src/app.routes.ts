import { Routes } from '@angular/router';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';

export const APP_ROUTES: Routes = [
  { path: '', component: RecipeSearchComponent, title: 'Recipe Search' },
  { path: 'recipe/:id', component: RecipeDetailComponent, title: 'Recipe Details' },
  { path: 'planner', component: MealPlannerComponent, title: 'Meal Planner' },
  { path: 'favorites', component: FavoritesComponent, title: 'My Favorites' },
  { path: 'shopping-list', component: ShoppingListComponent, title: 'Shopping List' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
