import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { PlannerService, Day } from '../../services/planner.service';
import { RecipeService } from '../../services/recipe.service';
import { NotificationService } from '../../services/notification.service';
import { MealPlan } from '../../services/planner.service';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meal-planner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlannerComponent {
  plannerService = inject(PlannerService);
  recipeService = inject(RecipeService);
  notificationService = inject(NotificationService);

  isLoading = signal(false);

  removeMeal(day: Day, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.plannerService.removeRecipeFromDay(day);
    this.notificationService.show(`Removed meal from ${day}.`, 'info');
  }

  clearWeek() {
    this.plannerService.clearPlan();
    this.notificationService.show('Meal plan has been cleared.', 'success');
  }

  generateRandomPlan() {
    this.isLoading.set(true);
    const randomRecipeObservables = this.plannerService.daysOfWeek.map(() => this.recipeService.getRandomRecipe());
    
    forkJoin(randomRecipeObservables).subscribe({
      next: (recipes) => {
        const newPlan: MealPlan = this.plannerService.getEmptyPlan();
        this.plannerService.daysOfWeek.forEach((day, index) => {
          newPlan[day] = recipes[index];
        });
        this.plannerService.updatePlan(newPlan);
        this.isLoading.set(false);
        this.notificationService.show('A new random meal plan has been generated!', 'success');
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.show('Failed to generate a random plan. Please try again.', 'error');
      }
    });
  }
}
