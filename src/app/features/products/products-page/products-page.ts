import {
  Component,
  OnInit,
  DestroyRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ProductsList } from '../products-list/products-list';
import { ProductFormDialog } from '../product-form-dialog/product-form-dialog';
import { ProductsApiService } from '../../../core/services/products.api.service';
import { ApiClientService } from '../../../core/services/api-client.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../../core/models/product.model';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

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
    PageHeader,
    ProductsList,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
})
export class ProductsPage implements OnInit{
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);
  private productsApi = inject(ProductsApiService);
  private apiClient = inject(ApiClientService);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  loadingList = false;
  totalProducts = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  isSearchActive = false;

  // Filter state
  selectedCategory = '';
  showInactive = false;
  categoryNames: string[] = [];

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
    const params: any = { page: 1, limit: this.pageSize, search: term };
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (!this.showInactive) params.isActive = 'true';
    this.productsApi.search({ page: 1, limit: this.pageSize, search: term, category: this.selectedCategory || undefined, isActive: this.showInactive ? undefined : true }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.products = response.items || [];
        this.totalProducts = response.total ?? this.products.length;
        this.loadingList = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 4000 });
        this.loadingList = false;
        this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[ProductsPage] loadProducts error:', err);
          this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 4000 });
          this.loadingList = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadDropdownData(): void {
    forkJoin({
      categories: this.apiClient.getAdapted<CategoryOption>('product-categories').pipe(catchError(() => of([]))),
      taxProfiles: this.apiClient.getAdapted<TaxProfileOption>('tax-profiles').pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ categories, taxProfiles }) => {
        this.categories = categories;
        this.taxProfiles = taxProfiles;
        this.categoryNames = categories.map(c => c.name);
        // Defer to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.metadataWarning = !this.categories.length || !this.taxProfiles.length
            ? 'No se pudieron cargar categorías y/o perfiles fiscales desde la API. El alta/edición puede quedar bloqueado hasta que esos endpoints estén disponibles.'
            : '';
          this.cdr.markForCheck();
        });
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
      // Search term cleared — reload with filters if active, otherwise full list
      this.currentPage = 1;
      if (this.selectedCategory || this.showInactive) {
        this.runSearch('');
      } else {
        this.loadProducts();
      }
    }
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    if (this.isSearchActive && this.searchTerm.trim()) {
      this.runSearch(this.searchTerm.trim());
    } else if (this.selectedCategory) {
      this.isSearchActive = true;
      this.runSearch('');
    } else {
      this.isSearchActive = false;
      this.loadProducts();
    }
  }

  onActiveFilterChange(showInactive: boolean): void {
    this.showInactive = showInactive;
    this.currentPage = 1;
    if (this.isSearchActive && this.searchTerm.trim()) {
      this.runSearch(this.searchTerm.trim());
    } else if (this.selectedCategory) {
      this.isSearchActive = true;
      this.runSearch('');
    } else {
      this.isSearchActive = false;
      this.loadProducts();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialog, {
      width: '650px',
      maxWidth: '90vw',
      data: { categories: this.categories, taxProfiles: this.taxProfiles },
    });

    dialogRef.componentInstance.submit.subscribe((payload) => this.handleFormSubmit(payload, null, dialogRef));
    dialogRef.componentInstance.cancel.subscribe(() => dialogRef.close());
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialog, {
      width: '650px',
      maxWidth: '90vw',
      data: { product, categories: this.categories, taxProfiles: this.taxProfiles },
    });

    dialogRef.componentInstance.submit.subscribe((payload) => this.handleFormSubmit(payload, product.id, dialogRef));
    dialogRef.componentInstance.cancel.subscribe(() => dialogRef.close());
  }

  private handleFormSubmit(payload: CreateProductDto | UpdateProductDto, productId: number | string | null, dialogRef: any): void {
    this.formSubmitting = true;
    if (productId) {
      this.productsApi.patch(productId, payload as UpdateProductDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
            dialogRef.close();
            this.refreshCurrentView();
            this.formSubmitting = false;
          },
          error: (err) => {
            const msg = err?.error?.errors?.[0]?.message || err?.error?.message || 'Error al actualizar producto';
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
            this.formSubmitting = false;
          },
        });
    } else {
      this.productsApi.create(payload as CreateProductDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
            dialogRef.close();
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
  }

  async confirmToggleActive(product: Product): Promise<void> {
    const action = product.isActive ? 'desactivar' : 'reactivar';
    const confirmed = await this.confirmDialog.open({
      title: 'Confirmar acción',
      message: `¿Estás seguro de que deseas ${action} "${product.name}"?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning',
    });
    if (!confirmed) return;

    this.productsApi.patch(product.id, { isActive: !product.isActive })
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
