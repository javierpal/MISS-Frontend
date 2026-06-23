import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  output,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Product, CreateProductDto, UpdateProductDto } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
})
export class ProductsForm implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly submit = output<CreateProductDto | UpdateProductDto>();
  readonly cancel = output<void>();

  readonly product = input<Product | null>(null);
  readonly loading = input(false);
  readonly submitting = input(false);
  readonly isEdit = input(false);
  readonly categories = input<Array<{ id: number; name: string }>>([]);
  readonly taxProfiles = input<Array<{ id: number; name: string }>>([]);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required]],
      barcode: [''],
      categoryId: [null],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      taxProfileId: [null, [Validators.required]],
    });

    if (this.isEdit() && this.product()) {
      this.patchForm(this.product()!);
    }
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      salePrice: product.salePrice,
      costPrice: product.purchasePrice ?? 0,
      minStock: product.minStock,
      taxProfileId: product.taxProfileId,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      sku: value.sku,
      barcode: value.barcode || '',
      categoryId: value.categoryId,
      salePrice: value.salePrice,
      costPrice: value.costPrice ?? undefined,
      minStock: value.minStock,
      taxProfileId: value.taxProfileId,
    };

    this.submit.emit(payload);
  }
}
