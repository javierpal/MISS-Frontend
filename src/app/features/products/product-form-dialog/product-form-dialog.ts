import { Component, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product, CreateProductDto, UpdateProductDto } from '../../../core/models/product.model';
import { ApiClientService } from '../../../core/services/api-client.service';

interface CategoryOption {
  id: number;
  name: string;
}

interface TaxProfileOption {
  id: number;
  name: string;
}

interface DialogData {
  product?: Product | null;
  categories?: CategoryOption[];
  taxProfiles?: TaxProfileOption[];
}

@Component({
  selector: 'app-product-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  templateUrl: './product-form-dialog.html',
  styleUrl: './product-form-dialog.scss',
})
export class ProductFormDialog implements OnInit{
  private fb = inject(FormBuilder);
  private apiClient = inject(ApiClientService);
  private dialogRef = inject(MatDialogRef<ProductFormDialog>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly submit = output<CreateProductDto | UpdateProductDto>();
  readonly cancel = output<void>();

  product: Product | null = null;
  isEdit = false;
  submitting = false;
  loadingCategories = true;

  categories: CategoryOption[] = [];
  taxProfiles: TaxProfileOption[] = [];

  form!: FormGroup;

  ngOnInit(): void {
    this.product = this.data?.product ?? null;
    this.isEdit = !!this.product;

    // Use provided data or load independently
    if (this.data?.categories && this.data?.taxProfiles) {
      this.categories = this.data.categories;
      this.taxProfiles = this.data.taxProfiles;
      this.loadingCategories = false;
    } else {
      this.loadDropdownData();
    }

    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Required
      sku: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      taxProfileId: [null, [Validators.required]],
      minStock: [0, [Validators.required, Validators.min(0)]],

      // Optional
      barcode: [''],
      slug: [''],
      categoryId: [null],
      brand: [''],
      manufacturer: [''],
      presentation: [''],
      unitOfMeasure: [''],
      description: [''],
      purchasePrice: [0, [Validators.min(0)]],
      pricesIncludeTax: [false],
      maxStock: [null, [Validators.min(0)]],
      requiresPrescription: [false],
      isControlled: [false],
      isActive: [true],
    });

    if (this.isEdit && this.product) {
      this.patchForm(this.product);
    }
  }

  private async loadDropdownData(): Promise<void> {
    try {
      const [cats, profiles] = await Promise.all([
        firstValueFrom(this.apiClient.getAdapted<CategoryOption>('product-categories').pipe(catchError(() => of([])))),
        firstValueFrom(this.apiClient.getAdapted<TaxProfileOption>('tax-profiles').pipe(catchError(() => of([])))),
      ]);
      this.categories = cats;
      this.taxProfiles = profiles;
    } catch {
      this.categories = [];
      this.taxProfiles = [];
    } finally {
      this.loadingCategories = false;
    }
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      sku: product.sku,
      name: product.name,
      barcode: product.barcode,
      slug: product.slug || '',
      categoryId: product.categoryId,
      brand: product.brand || '',
      manufacturer: product.manufacturer || '',
      presentation: product.presentation || '',
      unitOfMeasure: product.unitOfMeasure || '',
      description: product.description || '',
      salePrice: product.salePrice,
      purchasePrice: product.purchasePrice ?? 0,
      taxProfileId: product.taxProfileId,
      pricesIncludeTax: product.pricesIncludeTax ?? false,
      minStock: product.minStock,
      maxStock: product.maxStock ?? null,
      requiresPrescription: product.requiresPrescription ?? false,
      isControlled: product.isControlled ?? false,
      isActive: product.isActive ?? true,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateProductDto | UpdateProductDto = {
      // Required fields
      sku: value.sku,
      name: value.name,
      salePrice: value.salePrice,
      taxProfileId: value.taxProfileId,
      minStock: value.minStock,

      // Optional fields
      barcode: value.barcode || undefined,
      slug: value.slug || undefined,
      categoryId: value.categoryId || undefined,
      brand: value.brand || undefined,
      manufacturer: value.manufacturer || undefined,
      presentation: value.presentation || undefined,
      unitOfMeasure: value.unitOfMeasure || undefined,
      description: value.description || undefined,
      purchasePrice: value.purchasePrice > 0 ? value.purchasePrice : undefined,
      pricesIncludeTax: value.pricesIncludeTax,
      maxStock: value.maxStock ?? undefined,
      requiresPrescription: value.requiresPrescription,
      isControlled: value.isControlled,
      isActive: value.isActive,
    };

    this.submit.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
