import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-list',
  imports: [
    FormsModule,
    DecimalPipe,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList {
  readonly edit = output<Product>();
  readonly toggleActive = output<Product>();
  readonly pageChange = output<{ page: number; pageSize: number }>();
  readonly search = output<string>();

  readonly displayedColumns: string[] = [
    'name', 'sku', 'barcode', 'categoryName',
    'salePrice', 'taxProfileName', 'minStock', 'active', 'actions'
  ];

  readonly searchTerm = input('');
  readonly loading = input(false);
  readonly totalItems = input(0);
  readonly products = input<Product[]>([]);
  readonly pageSize = input(10);
  readonly currentPage = input(1);
  readonly showPaginator = input(true);

  // Filter inputs
  readonly categories = input<string[]>([]);
  readonly selectedCategory = input('');
  readonly showInactive = input(false);

  onSearchSubmit(searchInput: HTMLInputElement): void {
    const term = searchInput.value;
    this.search.emit(term);
  }

  clearSearch(): void {
    this.search.emit('');
  }

  onCategoryChange(value: string): void {
    this.categoryChange.emit(value);
  }

  onActiveFilterChange(event: any): void {
    const checked = event.checked;
    this.activeFilterChange.emit(checked);
  }

  clearAllFilters(): void {
    this.search.emit('');
    this.categoryChange.emit('');
    this.activeFilterChange.emit(false);
  }

  hasActiveFilters(): boolean {
    const cat = this.selectedCategory();
    const inactive = this.showInactive();
    return !!(cat || inactive);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }

  readonly categoryChange = output<string>();
  readonly activeFilterChange = output<boolean>();
}
