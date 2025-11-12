import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlannerService } from '../../services/planner.service';
import { NotificationService } from '../../services/notification.service';
import { Ingredient, Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shopping-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent {
  plannerService = inject(PlannerService);
  notificationService = inject(NotificationService);

  shoppingList = computed<Ingredient[]>(() => {
    const plan = this.plannerService.plan();
    const allIngredients: Ingredient[] = [];

    for (const day of this.plannerService.daysOfWeek) {
      const recipe = plan[day];
      if (recipe) {
        for (let i = 1; i <= 20; i++) {
          const ingredientName = recipe[`strIngredient${i}` as keyof Recipe] as string;
          const measure = recipe[`strMeasure${i}` as keyof Recipe] as string;
          if (ingredientName) {
            allIngredients.push({ name: ingredientName.trim(), measure: measure ? measure.trim() : '' });
          }
        }
      }
    }
    
    // This is a simple consolidation. A more advanced version would handle unit conversions.
    const consolidatedList = new Map<string, string[]>();
    allIngredients.forEach(ing => {
        const existing = consolidatedList.get(ing.name.toLowerCase());
        if(existing) {
            existing.push(ing.measure);
        } else {
            consolidatedList.set(ing.name.toLowerCase(), [ing.measure]);
        }
    });

    const finalList: Ingredient[] = [];
    consolidatedList.forEach((measures, name) => {
        finalList.push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            measure: measures.join(', ')
        });
    });

    return finalList.sort((a,b) => a.name.localeCompare(b.name));
  });

  copyToClipboard(): void {
    const listText = this.shoppingList()
      .map(item => `- ${item.name}: ${item.measure}`)
      .join('\n');
    
    navigator.clipboard.writeText(listText).then(() => {
      this.notificationService.show('Shopping list copied to clipboard!', 'success');
    }, () => {
      this.notificationService.show('Failed to copy list.', 'error');
    });
  }
}
