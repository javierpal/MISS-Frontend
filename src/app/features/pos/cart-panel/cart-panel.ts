import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CartItem } from '../../../core/models/cart-item.model';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-panel.html',
  styleUrl: './cart-panel.scss',
})
export class CartPanel {
  /** Items currently in the cart */
  readonly items = input.required<CartItem[]>();

  /** Emitted when user wants to remove an item */
  readonly removeItem = output<string>();

  /** Emitted when user changes quantity */
  readonly updateQuantity = output<{ productId: string; quantity: number }>();

  /** Emitted when user clears the entire cart */
  readonly clearCart = output<void>();

  /** Emitted when user confirms the cart to proceed to payment */
  readonly confirmCart = output<void>();

  subtotal(): number {
    return this.items().reduce((sum, item) => sum + item.lineTotal, 0);
  }

  taxRate(): number {
    return 0.16;
  }

  tax(): number {
    return +(this.subtotal() * this.taxRate()).toFixed(2);
  }

  total(): number {
    return +(this.subtotal() + this.tax()).toFixed(2);
  }

  itemCount(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items().length === 0;
  }

  onRemove(productId: string): void {
    this.removeItem.emit(productId);
  }

  onQuantityChange(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem.emit(productId);
    } else {
      this.updateQuantity.emit({ productId, quantity });
    }
  }
}
