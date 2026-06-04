import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
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

    <app-products-list
      [searchTerm]="searchTerm"
      [loading]="loadingList"
      [totalItems]="totalProducts"
      [products]="products"
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
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ProductsPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);
  private productsApi = inject(ProductsApiService);

  products: Product[] = [];
  loadingList = false;
  totalProducts = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  showForm = false;
  editingProduct: Product | null = null;
  formLoading = false;
  formSubmitting = false;

  categories: CategoryOption[] = [];
  taxProfiles: TaxProfileOption[] = [];

  ngOnInit(): void {
    this.loadProducts();
    this.loadDropdownData();
  }

  private loadProducts(): void {
    this.loadingList = true;
    this.productsApi
      .list({ page: this.currentPage, pageSize: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products = response.items || [];
          this.totalProducts = response.total ?? 0;
          const listEl = document.querySelector('app-products-list');
          if (listEl && typeof (listEl as any).setProducts === 'function') {
            (listEl as any).setProducts(this.products);
          }
          this.loadingList = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 4000 });
          this.loadingList = false;
        },
      });
  }

  private loadDropdownData(): void {
    this.categories = [];
    this.taxProfiles = [];
  }

  onPageChange(params: { page: number; pageSize: number }): void {
    this.currentPage = params.page;
    this.pageSize = params.pageSize;
    this.loadProducts();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    if (term.trim()) {
      this.loadingList = true;
      this.productsApi.search({ query: term }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (results) => {
          this.products = results;
          this.totalProducts = results.length;
          const listEl = document.querySelector('app-products-list');
          if (listEl && typeof (listEl as any).setProducts === 'function') {
            (listEl as any).setProducts(this.products);
          }
          this.loadingList = false;
        },
        error: () => {
          this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 4000 });
          this.loadingList = false;
        },
      });
    } else {
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
      const updatePayload = payload as UpdateProductDto;
      this.productsApi
        .update(this.editingProduct.id, updatePayload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.closeForm();
            this.loadProducts();
            this.formSubmitting = false;
          },
          error: (err) => {
            const msg = err?.error?.errors?.[0]?.message || err?.error?.message || 'Error al actualizar producto';
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
            this.formSubmitting = false;
          },
        });
    } else {
      const createPayload = payload as CreateProductDto;
      this.productsApi.create(createPayload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadProducts();
          this.formSubmitting = false;
        },
        error: (err) => {
          const errors = err?.error?.errors || [];
          let msg = 'Error al crear producto';
          if (errors.length > 0) {
            msg = errors.map((e: { message?: string }) => e.message).join(', ');
          } else if (err?.error?.message) {
            msg = err.error.message;
          }
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          this.formSubmitting = false;
        },
      });
    }
  }

  confirmToggleActive(product: Product): void {
    const action = product.active ? 'desactivar' : 'reactivar';
    const confirmed = window.confirm('¿Estás seguro de que deseas ' + action + ' "' + product.name + '"?');
    if (!confirmed) return;

    this.productsApi.patch(product.id, { active: !product.active }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.snackBar.open('Producto ' + action + ' correctamente', 'Cerrar', { duration: 3000 });
        this.loadProducts();
      },
      error: () => {
        this.snackBar.open('Error al ' + action + ' el producto', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
