import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryApiService } from '../../../core/services/inventory.api.service';
import { InventoryStock, ProductStockResponse, CreateInventoryEntryDto, CreateInventoryAdjustmentDto, KardexMovement } from '../../../core/models/inventory.model';

interface StockRow {
  productName: string;
  sku: string;
  totalStock: number;
  lotsActive: number;
}

@Component({
  selector: 'app-inventory-page',
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, ReactiveFormsModule, MatInputModule, MatSnackBarModule,
  ],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.scss',
})
export class InventoryPage implements OnInit {
  displayedColumns: string[] = [
    'productName', 'sku', 'totalStock',
    'status', 'lotsActive'
  ];
  stockData: StockRow[] = [];
  loading = false;

  entryForm!: FormGroup;
  adjustmentForm!: FormGroup;
  submitting = false;
  submittingAdjustment = false;
  kardexForm!: FormGroup;
  loadingKardex = false;
  kardexQueried = false;
  kardexData: KardexMovement[] = [];

  constructor(
    private inventoryApi: InventoryApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadStock();
    this.ngOnInitAdjustment();
    this.ngOnInitKardex();
    this.entryForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unitCost: [null, [Validators.required, Validators.min(0)]],
      batchNumber: [''],
      expiryDate: [''],
      reference: [''],
      note: [''],
    });
  }

  ngOnInitAdjustment(): void {
    this.adjustmentForm = this.fb.group({
      productId: ['', Validators.required],
      adjustment: [null, [Validators.required]],
      reason: ['', Validators.required],
      reference: [''],
      note: [''],
    });
  }

  ngOnInitKardex(): void {
    this.kardexForm = this.fb.group({
      productId: ['', Validators.required],
    });
  }

  loadStock(): void {
    this.loading = true;
    this.inventoryApi.getStock().subscribe({
      next: (data: InventoryStock[]) => {
        this.stockData = data.map((item: InventoryStock) => ({
          productName: item.product.name,
          sku: item.product.sku,
          totalStock: item.stock,
          lotsActive: item.activeLots,
        }));
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Error loading inventory stock:', err);
        this.loading = false;
      },
    });
  }

  onSubmitEntry(): void {
    if (this.entryForm.invalid) {
      this.snackBar.open('Completa los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const value = this.entryForm.value;
    const body: CreateInventoryEntryDto = {
      productId: value.productId,
      quantity: Number(value.quantity),
      unitCost: Number(value.unitCost),
      batchNumber: value.batchNumber || undefined,
      expiryDate: value.expiryDate || undefined,
      reference: value.reference || undefined,
      note: value.note || undefined,
    };

    this.inventoryApi.createEntry(body).subscribe({
      next: () => {
        this.snackBar.open('Entrada registrada correctamente', 'Cerrar', { duration: 3000 });
        this.entryForm.reset();
        this.loadStock();
        this.submitting = false;
      },
      error: (err: unknown) => {
        console.error('Error creating entry:', err);
        this.snackBar.open('Error al registrar la entrada', 'Cerrar', { duration: 5000 });
        this.submitting = false;
      },
    });
  }

  onSubmitAdjustment(): void {
    if (this.adjustmentForm.invalid) {
      this.snackBar.open('Completa los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.submittingAdjustment = true;
    const value = this.adjustmentForm.value;
    const body: CreateInventoryAdjustmentDto = {
      productId: value.productId,
      adjustment: Number(value.adjustment),
      reason: value.reason,
      reference: value.reference || undefined,
      note: value.note || undefined,
    };

    this.inventoryApi.createAdjustment(body).subscribe({
      next: () => {
        this.snackBar.open('Ajuste registrado correctamente', 'Cerrar', { duration: 3000 });
        this.adjustmentForm.reset();
        this.loadStock();
        this.submittingAdjustment = false;
      },
      error: (err: unknown) => {
        console.error('Error creating adjustment:', err);
        this.snackBar.open('Error al registrar el ajuste', 'Cerrar', { duration: 5000 });
        this.submittingAdjustment = false;
      },
    });
  }

  onConsultKardex(): void {
    if (this.kardexForm.invalid) {
      this.snackBar.open('Ingresa el Producto ID', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loadingKardex = true;
    const productId = this.kardexForm.value.productId;

    this.inventoryApi.getKardex(productId).subscribe({
      next: (data: KardexMovement[]) => {
        this.kardexData = data;
        this.kardexQueried = true;
        this.loadingKardex = false;
      },
      error: (err: unknown) => {
        console.error('Error loading kardex:', err);
        this.snackBar.open('Error al cargar el kardex', 'Cerrar', { duration: 5000 });
        this.kardexData = [];
        this.kardexQueried = true;
        this.loadingKardex = false;
      },
    });
  }

  getStatusColor(row: StockRow): string {
    if (row.totalStock === 0) return '#f44336';
    return '#4caf50';
  }

  getStatusText(row: StockRow): string {
    if (row.totalStock === 0) return 'Sin stock';
    return 'Normal';
  }
}
