import { ChangeDetectionStrategy, Component, output, OnInit, inject } from '@angular/core';
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

import { Product, CreateProductDto, UpdateProductDto } from '../../core/models/product.model';
import { ApiClientService } from '../../core/services/api-client.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div mat-dialog-title>
      {{ isEdit ? 'Editar producto' : 'Nuevo producto' }}
    </div>

    <mat-dialog-content>
      <p class="required-note">* Campos requeridos</p>

      @if (loadingCategories) {
        <div class="form-spinner">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

          <!-- SECTION: Información básica -->
          <h4 class="section-title">Información básica</h4>

          <!-- Row 1: SKU + Name -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>SKU *</mat-label>
              <input matInput formControlName="sku" placeholder="Código único" />
              @if (form.get('sku')?.hasError('required')) {
                <mat-error>El SKU es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Nombre *</mat-label>
              <input matInput formControlName="name" placeholder="Nombre del producto" />
              @if (form.get('name')?.hasError('required')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Row 2: Barcode + Slug -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Código de barras</mat-label>
              <input matInput formControlName="barcode" placeholder="Opcional" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Slug</mat-label>
              <input matInput formControlName="slug" placeholder="URL amigable (opcional)" />
            </mat-form-field>
          </div>

          <!-- Row 3: Category + Brand -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option value="">Sin categoría</mat-option>
                @for (cat of categories; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Marca</mat-label>
              <input matInput formControlName="brand" placeholder="Opcional" />
            </mat-form-field>
          </div>

          <!-- Row 4: Manufacturer + Unit of Measure -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Fabricante</mat-label>
              <input matInput formControlName="manufacturer" placeholder="Opcional" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Presentación</mat-label>
              <input matInput formControlName="presentation" placeholder="Ej: Caja x12" />
            </mat-form-field>
          </div>

          <!-- Row 5: Unit of Measure -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Unidad de medida</mat-label>
              <input matInput formControlName="unitOfMeasure" placeholder="Ej: unidad, kg, litro" />
            </mat-form-field>
          </div>

          <!-- Row 6: Description -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="Descripción opcional del producto"></textarea>
            </mat-form-field>
          </div>

          <!-- SECTION: Precios -->
          <h4 class="section-title">Precios</h4>

          <!-- Row 7: Sale Price + Purchase Price -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Precio venta *</mat-label>
              <input matInput type="number" formControlName="salePrice" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>$ </span>
              @if (form.get('salePrice')?.hasError('required')) {
                <mat-error>El precio es obligatorio</mat-error>
              }
              @if (form.get('salePrice')?.hasError('min')) {
                <mat-error>Debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Precio costo</mat-label>
              <input matInput type="number" formControlName="purchasePrice" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>$ </span>
            </mat-form-field>
          </div>

          <!-- Row 8: Prices include tax + Tax Profile -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Perfil fiscal *</mat-label>
              <mat-select formControlName="taxProfileId">
                @for (profile of taxProfiles; track profile.id) {
                  <mat-option [value]="profile.id">{{ profile.name }}</mat-option>
                }
              </mat-select>
              @if (form.get('taxProfileId')?.hasError('required')) {
                <mat-error>El perfil fiscal es obligatorio</mat-error>
              }
            </mat-form-field>

            <div class="checkbox-wrap">
              <mat-checkbox formControlName="pricesIncludeTax">
                Precio incluye IVA
              </mat-checkbox>
            </div>
          </div>

          <!-- SECTION: Inventario -->
          <h4 class="section-title">Inventario</h4>

          <!-- Row 9: Min Stock + Max Stock -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Stock mínimo *</mat-label>
              <input matInput type="number" formControlName="minStock" placeholder="0" min="0" />
              @if (form.get('minStock')?.hasError('required')) {
                <mat-error>El stock mínimo es obligatorio</mat-error>
              }
              @if (form.get('minStock')?.hasError('min')) {
                <mat-error>Debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>Stock máximo</mat-label>
              <input matInput type="number" formControlName="maxStock" placeholder="Opcional" min="0" />
            </mat-form-field>
          </div>

          <!-- SECTION: Regulaciones -->
          <h4 class="section-title">Regulaciones</h4>

          <!-- Row 10: Checkboxes -->
          <div class="form-row checkboxes-row">
            <mat-checkbox formControlName="requiresPrescription">
              Requiere receta médica
            </mat-checkbox>

            <mat-checkbox formControlName="isControlled">
              Producto controlado
            </mat-checkbox>
          </div>

          <!-- Row 11: Active checkbox -->
          <div class="form-row">
            <mat-checkbox formControlName="isActive">
              Activo
            </mat-checkbox>
          </div>

        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="onCancel()">
        Cancelar
      </button>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting" (click)="onSubmit()">
        @if (submitting) {
          <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
        } @else {
          {{ isEdit ? 'Guardar cambios' : 'Crear producto' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .required-note {
      font-size: 0.85rem;
      color: #666;
      margin: 0 0 1rem 0;
    }

    .section-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0d47a1;
      margin: 1.5rem 0 0.8rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #1976d2;
      letter-spacing: 0.02em;
    }

    .section-title:first-child {
      margin-top: 0;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .field-half {
      flex: 1;
      min-width: 180px;
    }

    .field-third {
      flex: 1;
      min-width: 130px;
    }

    .field-full {
      flex: 1;
      min-width: 300px;
    }

    .checkbox-wrap {
      display: flex;
      align-items: center;
      padding-top: 1.5rem;
    }

    .checkboxes-row {
      align-items: center;
    }

    .form-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 0;
    }

    .btn-spinner {
      margin-right: 0.5rem;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }
    }
  `],
})
export class ProductFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiClient = inject(ApiClientService);
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
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
