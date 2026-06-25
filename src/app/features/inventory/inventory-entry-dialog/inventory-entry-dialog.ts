import { Component, OnInit } from '@angular/core';

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryApiService } from '../../../core/services/inventory.api.service';
import { CreateInventoryEntryDto } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-entry-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    ReactiveFormsModule, MatSnackBarModule
  ],
  templateUrl: './inventory-entry-dialog.html',
  styleUrl: './inventory-entry-dialog.scss',
})
export class InventoryEntryDialog implements OnInit {
  entryForm!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InventoryEntryDialog>,
    private inventoryApi: InventoryApiService,
  ) {}

  ngOnInit(): void {
    this.entryForm = this.fb.group({
      productId: ['', Validators.required],
      quantityReceived: [null, [Validators.required, Validators.min(1)]],
      unitCost: [null, [Validators.required, Validators.min(0)]],
      receivedAt: [todayISO(), Validators.required],
      batchNumber: [''],
      expirationDate: [''],
      note: [''],
    });
  }

  onSubmit(): void {
    if (this.entryForm.invalid) {
      this.snackBar.open('Completa los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const value = this.entryForm.value;
    const body: CreateInventoryEntryDto = {
      productId: value.productId,
      quantityReceived: Number(value.quantityReceived),
      unitCost: Number(value.unitCost),
      receivedAt: value.receivedAt,
      batchNumber: value.batchNumber || undefined,
      expirationDate: value.expirationDate || undefined,
      note: value.note || undefined,
    };

    this.inventoryApi.createEntry(body).subscribe({
      next: () => {
        this.snackBar.open('Entrada registrada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        console.error('Error creating entry:', err);
        this.snackBar.open('Error al registrar la entrada', 'Cerrar', { duration: 5000 });
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
