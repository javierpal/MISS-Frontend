import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { ProductsApiService } from '../../../core/services/products.api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-search-bar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search-bar.html',
  styleUrl: './product-search-bar.scss',
})
export class ProductSearchBar implements OnChanges, OnDestroy {
  private productsApi = inject(ProductsApiService);

  @Input() searchQuery = '';

  searchResults = signal<Product[]>([]);
  searching = signal(false);
  searchError = signal<string | null>(null);

  productSelected = output<Product>();

  private searchTimeout: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      const query = this.searchQuery;
      // Clear previous timeout to debounce
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      if (!query || query.length < 2) {
        this.searchResults.set([]);
        this.searchError.set(null);
        this.searching.set(false);
        return;
      }
      this.searching.set(true);
      this.searchTimeout = setTimeout(() => {
        this.productsApi.search({ search: query, limit: 20 }).subscribe({
          next: (res) => {
            this.searchResults.set(res.items);
            this.searching.set(false);
          },
          error: (err) => {
            this.searchError.set(err?.message ?? 'Error buscando productos');
            this.searching.set(false);
          },
        });
      }, 300);
    }
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  selectProduct(product: Product): void {
    this.productSelected.emit(product);
  }
}
