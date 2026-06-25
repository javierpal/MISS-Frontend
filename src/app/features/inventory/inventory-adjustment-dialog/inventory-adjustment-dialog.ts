import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryApiService } from '../../../core/services/inventory.api.service';
import { CreateInventoryAdjustmentDto } from '../../../core/models/inventory.model';

interface AdjustmentDialogData {
  productId: string | number;
}

@Component({
  selector: 'app-inventory-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, ReactiveFormsModule, MatSnackBarModule
  ],
  templateUrl: './inventory-adjustment-dialog.html',
  styleUrl: './inventory-adjustment-dialog.scss',
})
export class InventoryAdjustmentDialog implements OnInit {
  adjustmentForm!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InventoryAdjustmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AdjustmentDialogData,
    private inventoryApi: InventoryApiService,
  ) {}

  ngOnInit(): void {
    this.adjustmentForm = this.fb.group({
      adjustment: [null, [Validators.required]],
      reason: ['', Validators.required],
      reference: [''],
      note: [''],
    });
  }

  onSubmit(): void {
    if (this.adjustmentForm.invalid) {
      this.snackBar.open('Completa los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const value = this.adjustmentForm.value;
    const body: CreateInventoryAdjustmentDto = {
      productId: this.data.productId,
      adjustment: Number(value.adjustment),
      reason: value.reason,
      reference: value.reference || undefined,
      note: value.note || undefined,
    };

    this.inventoryApi.createAdjustment(body).subscribe({
      next: () => {
        this.snackBar.open('Ajuste registrado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        console.error('Error creating adjustment:', err);
        this.snackBar.open('Error al registrar el ajuste', 'Cerrar', { duration: 5000 });
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
