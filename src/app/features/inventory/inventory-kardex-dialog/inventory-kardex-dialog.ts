import { Component, Inject, OnInit, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryApiService } from '../../../core/services/inventory.api.service';
import { KardexMovement, KardexResponse, KardexQueryParams } from '../../../core/models/inventory.model';

interface KardexDialogData {
  productId: string | number;
}

@Component({
  selector: 'app-inventory-kardex-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatTableModule,
    MatProgressSpinnerModule, MatSelectModule, MatNativeDateModule,
    MatIconModule, ReactiveFormsModule, MatSnackBarModule
  ],
  templateUrl: './inventory-kardex-dialog.html',
  styleUrl: './inventory-kardex-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryKardexDialog implements OnInit, AfterViewInit {
  kardexForm!: FormGroup;
  loadingKardex = false;
  kardexQueried = false;
  kardexData: KardexMovement[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InventoryKardexDialog>,
    @Inject(MAT_DIALOG_DATA) public data: KardexDialogData,
    private inventoryApi: InventoryApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.kardexForm = this.fb.group({
      productId: [this.data.productId, Validators.required],
      type: [''],
      from: [''],
      to: [''],
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.loadKardex();
    });
  }

  onConsultKardex(): void {
    if (this.kardexForm.invalid) {
      this.snackBar.open('Ingresa el Producto ID', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loadKardex();
  }

  loadKardex(): void {
    this.loadingKardex = true;
    const productId = this.kardexForm.value.productId;
    const formValue = this.kardexForm.value;

    const params: KardexQueryParams = {};
    if (formValue.type) params.type = formValue.type;
    if (formValue.from) params.from = formValue.from;
    if (formValue.to) params.to = formValue.to;

    this.inventoryApi.getKardex(productId, params).subscribe({
      next: (res: KardexResponse) => {
        this.kardexData = res.data;
        this.kardexQueried = true;
        this.loadingKardex = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error loading kardex:', err);
        this.snackBar.open('Error al cargar el kardex', 'Cerrar', { duration: 5000 });
        this.kardexData = [];
        this.kardexQueried = true;
        this.loadingKardex = false;
        this.cdr.detectChanges();
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
