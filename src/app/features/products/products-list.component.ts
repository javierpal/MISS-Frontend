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

import { Product } from '../../core/models/product.model';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="products-list-card">
      <mat-card-content>
        <!-- Row 1: Search field + Category filter + Active filter -->
        <div class="products-list__search-row">
          <!-- Search field with search button at the end (suffix) -->
          <mat-form-field appearance="outline" class="products-list__search-field">
            <mat-label>Buscar producto</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input
              #searchInput
              matInput
              type="text"
              placeholder="Nombre, SKU o código de barras"
              [value]="searchTerm()"
              (keyup.enter)="onSearchSubmit(searchInput)"
            />
            @if (searchTerm() !== '') {
              <button matSuffix mat-icon-button type="button" (click)="clearSearch()" aria-label="Limpiar búsqueda">
                <mat-icon>close</mat-icon>
              </button>
            } @else {
              <button matSuffix mat-icon-button type="button" (click)="onSearchSubmit(searchInput)" aria-label="Buscar">
                <mat-icon>search</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- Category filter -->
          <mat-form-field appearance="outline" class="products-list__filter-field">
            <mat-label>Categoría</mat-label>
            <mat-select [ngModel]="selectedCategory()" (ngModelChange)="onCategoryChange($event)">
              <mat-option value="">Todas</mat-option>
              @for (cat of categories(); track cat) {
                <mat-option [value]="cat">{{ cat }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Active filter -->
          <div class="products-list__active-filter">
            <mat-checkbox [checked]="showInactive()" (change)="onActiveFilterChange($event)">
              Incluir inactivos
            </mat-checkbox>
          </div>

          <!-- Clear all filters button -->
          @if (hasActiveFilters()) {
            <button mat-stroked-button color="warn" (click)="clearAllFilters()" class="products-list__clear-all-btn">
              <mat-icon>clear_all</mat-icon>
              Limpiar filtros
            </button>
          }
        </div>

        <!-- Row 3: Product count -->
        <div class="products-list__count-row">
          <span class="products-list__count">{{ totalItems() }} productos</span>
        </div>

        <div class="products-list__table-wrapper">
          <table mat-table [dataSource]="products()" class="products-list__table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let product" class="products-list__cell-name">{{ product.name }}</td>
            </ng-container>

            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef>SKU</th>
              <td mat-cell *matCellDef="let product">{{ product.sku }}</td>
            </ng-container>

            <ng-container matColumnDef="barcode">
              <th mat-header-cell *matHeaderCellDef>Código barras</th>
              <td mat-cell *matCellDef="let product">{{ product.barcode || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="categoryName">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let product">{{ product.categoryName || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="salePrice">
              <th mat-header-cell *matHeaderCellDef>Precio venta</th>
              <td mat-cell *matCellDef="let product" class="products-list__cell-price">{{ product.salePrice | number : '1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="taxProfileName">
              <th mat-header-cell *matHeaderCellDef>Perfil fiscal</th>
              <td mat-cell *matCellDef="let product">{{ product.taxProfileName || product.taxProfileId }}</td>
            </ng-container>

            <ng-container matColumnDef="minStock">
              <th mat-header-cell *matHeaderCellDef>Stock mín.</th>
              <td mat-cell *matCellDef="let product">{{ product.minStock }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let product">
                <span class="status-chip" [class.status-chip--active]="product.active" [class.status-chip--inactive]="!product.active">
                  {{ product.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let product" class="products-list__cell-actions">
                <button mat-icon-button (click)="edit.emit(product)" aria-label="Editar producto">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button [attr.aria-label]="product.active ? 'Desactivar producto' : 'Reactivar producto'" (click)="toggleActive.emit(product)">
                  <mat-icon>{{ product.active ? 'highlight_off' : 'check_circle' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [colSpan]="displayedColumns.length">
                <p class="products-list__empty">No se encontraron productos</p>
              </td>
            </tr>
          </table>

          @if (loading()) {
            <div class="products-list__spinner">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          }
        </div>

        @if (showPaginator()) {
          <mat-paginator
            [length]="totalItems()"
            [pageIndex]="currentPage() - 1"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50]"
            [showFirstLastButtons]="true"
            aria-label="Seleccionar página de productos"
            (page)="onPage($event)"
          ></mat-paginator>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .products-list-card { margin-bottom: 1rem; }
    .products-list__search-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; flex-wrap: wrap; }
    .products-list__search-field { flex: 1; min-width: 200px; }
    .products-list__filter-field { flex: 1; min-width: 150px; max-width: 250px; }
    .products-list__active-filter { display: flex; align-items: center; white-space: nowrap; }
    .products-list__clear-all-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      padding: 0 0.75rem;
    }
    .products-list__count { font-size: 0.85rem; color: var(--miss-text-muted); white-space: nowrap; }
    .products-list__count-row { padding: 0.25rem 1.25rem 0.75rem; }
    .products-list__table-wrapper { position: relative; min-height: 200px; }
    .products-list__table { width: 100%; }
    .mat-header-cell { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--miss-text-muted); padding: 12px 16px; }
    .mat-cell { padding: 12px 16px; font-size: 0.9rem; }
    .products-list__cell-name { font-weight: 500; color: var(--miss-text); }
    .products-list__cell-price { font-weight: 600; font-variant-numeric: tabular-nums; }
    .products-list__cell-actions { white-space: nowrap; }
    .status-chip { display: inline-flex; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .status-chip--active { background: rgba(46, 125, 50, 0.12); color: var(--miss-success); }
    .status-chip--inactive { background: rgba(198, 40, 40, 0.12); color: var(--miss-error); }
    .products-list__empty { text-align: center; color: var(--miss-text-muted); padding: 3rem 0; margin: 0; }
    .products-list__spinner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--miss-surface); z-index: 1; }
    @media (max-width: 960px) {
      .products-list__search-row { padding: 0.75rem 1rem; }
      .mat-cell, .mat-header-cell { padding: 8px 12px; font-size: 0.82rem; }
    }
  `],
})
export class ProductsListComponent {
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
