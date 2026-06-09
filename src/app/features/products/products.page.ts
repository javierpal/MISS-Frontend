import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProductsListComponent } from './products-list.component';
import { ProductFormComponent } from './product-form.component';
import { ProductsApiService } from '../../core/services/products.api.service';
import { ApiClientService } from '../../core/services/api-client.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../core/models/product.model';

interface CategoryOption {
  id: number;
  name: string;
}

interface TaxProfileOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-products-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    ProductsListComponent,
    ProductFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Productos" subtitle="Catálogo, altas, edición y segmentación de productos">
      <button mat-raised-button color="primary" (click)="openCreateDialog()" action>
        <mat-icon>add</mat-icon>
        Nuevo producto
      </button>
    </app-page-header>

    @if (metadataWarning) {
      <mat-card class="products-warning-card">
        <mat-card-content>
          <div class="products-warning-card__body">
            <mat-icon color="warn">warning</mat-icon>
            <span>{{ metadataWarning }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    }

    <app-products-list
      [searchTerm]="searchTerm"
      [loading]="loadingList"
      [totalItems]="totalProducts"
      [products]="products"
      [pageSize]="pageSize"
      [currentPage]="currentPage"
      [showPaginator]="!isSearchActive"
      (edit)="openEditDialog($event)"
      (toggleActive)="confirmToggleActive($event)"
      (pageChange)="onPageChange($event)"
      (search)="onSearch($event)"
    />

    @if (showForm) {
      <app-product-form
        [product]="editingProduct"
        [loading]="formLoading"
        [submitting]="formSubmitting"
        [isEdit]="!!editingProduct"
        [categories]="categories"
        [taxProfiles]="taxProfiles"
        (submit)="onFormSubmit($event)"
        (cancel)="closeForm()"
      />
    }
  `,
  styles: [``],
})
export class ProductsPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);
  private productsApi = inject(ProductsApiService);
  private apiClient = inject(ApiClientService);

  products: Product[] = [];
  loadingList = false;
  totalProducts = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  isSearchActive = false;

  showForm = false;
  editingProduct: Product | null = null;
  formLoading = false;
  formSubmitting = false;

  categories: CategoryOption[] = [];
  taxProfiles: TaxProfileOption[] = [];
  metadataWarning = '';

  ngOnInit(): void {
    this.loadProducts();
    this.loadDropdownData();
  }

  private refreshCurrentView(): void {
    if (this.isSearchActive && this.searchTerm.trim()) {
      this.runSearch(this.searchTerm.trim());
      return;
    }
    this.loadProducts();
  }

  private runSearch(term: string): void {
    this.loadingList = true;
    this.productsApi.search({ page: 1, limit: this.pageSize, search: term }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.products = response.items || [];
        this.totalProducts = response.total ?? this.products.length;
        this.loadingList = false;
      },
      error: () => {
        this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 4000 });
        this.loadingList = false;
      },
    });
  }

  private loadProducts(): void {
    this.loadingList = true;
    this.productsApi
      .list({ page: this.currentPage, limit: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products = response.items || [];
          this.totalProducts = response.total ?? this.products.length;
          this.loadingList = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 4000 });
          this.loadingList = false;
        },
      });
  }

  private loadDropdownData(): void {
    forkJoin({
      categories: this.apiClient.get<CategoryOption[]>('product-categories').pipe(catchError(() => of([]))),
      taxProfiles: this.apiClient.get<TaxProfileOption[]>('tax-profiles').pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ categories, taxProfiles }) => {
        this.categories = categories;
        this.taxProfiles = taxProfiles;
        this.metadataWarning = !this.categories.length || !this.taxProfiles.length
          ? 'No se pudieron cargar categorías y/o perfiles fiscales desde la API. El alta/edición puede quedar bloqueado hasta que esos endpoints estén disponibles.'
          : '';
      });
  }

  onPageChange(params: { page: number; pageSize: number }): void {
    if (this.isSearchActive) return;
    this.currentPage = params.page;
    this.pageSize = params.pageSize;
    this.loadProducts();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.isSearchActive = term.trim().length > 0;
    if (this.isSearchActive) {
      this.currentPage = 1;
      this.runSearch(term.trim());
    } else {
      this.currentPage = 1;
      this.loadProducts();
    }
  }

  openCreateDialog(): void {
    this.editingProduct = null;
    this.showForm = true;
  }

  openEditDialog(product: Product): void {
    this.editingProduct = product;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
  }

  onFormSubmit(payload: CreateProductDto | UpdateProductDto): void {
    this.formSubmitting = true;
    if (this.editingProduct) {
      this.productsApi.update(this.editingProduct.id, payload as UpdateProductDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.closeForm();
            this.refreshCurrentView();
            this.formSubmitting = false;
          },
          error: (err) => {
            const msg = err?.error?.errors?.[0]?.message || err?.error?.message || 'Error al actualizar producto';
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
            this.formSubmitting = false;
          },
        });
      return;
    }

    this.productsApi.create(payload as CreateProductDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.refreshCurrentView();
          this.formSubmitting = false;
        },
        error: (err) => {
          const errors = err?.error?.errors || [];
          let msg = 'Error al crear producto';
          if (errors.length > 0) msg = errors.map((e: { message?: string }) => e.message).join(', ');
          else if (err?.error?.message) msg = err.error.message;
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          this.formSubmitting = false;
        },
      });
  }

  confirmToggleActive(product: Product): void {
    const action = product.active ? 'desactivar' : 'reactivar';
    const confirmed = window.confirm('¿Estás seguro de que deseas ' + action + ' "' + product.name + '"?');
    if (!confirmed) return;

    this.productsApi.patch(product.id, { active: !product.active })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Producto ' + action + ' correctamente', 'Cerrar', { duration: 3000 });
          this.refreshCurrentView();
        },
        error: () => {
          this.snackBar.open('Error al ' + action + ' el producto', 'Cerrar', { duration: 4000 });
        },
      });
  }
}
