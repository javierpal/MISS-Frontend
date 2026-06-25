import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ProductsApiService } from '../../../core/services/products.api.service';
import { Product } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart-item.model';

@Component({
  selector: 'app-product-search-bar',
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search-bar.html',
  styleUrl: './product-search-bar.scss',
})
export class ProductSearchBar implements OnInit, OnDestroy {
  private productsApi = inject(ProductsApiService);
  private destroy$ = new Subject<void>();

  searchControl = signal('');
  searching = signal(false);
  searchResults = signal<Product[]>([]);
  searchError = signal<string | null>(null);

  readonly onProductSelected = new Subject<Product>();

  constructor() {
    effect(() => {
      const query = this.searchControl();
      if (!query || query.length < 2) {
        this.searchResults.set([]);
        this.searchError.set(null);
        return;
      }
      this.searching.set(true);
      this.productsApi
        .search({ search: query, limit: 20 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.searchResults.set(res.items);
            this.searching.set(false);
          },
          error: (err) => {
            this.searchError.set(err?.message ?? 'Error buscando productos');
            this.searching.set(false);
          },
        });
    });
  }

  ngOnInit(): void {
    // No extra init needed; signals drive the search
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectProduct(product: Product): void {
    this.onProductSelected.next(product);
    this.searchControl.set('');
    this.searchResults.set([]);
    this.searchError.set(null);
  }
}
