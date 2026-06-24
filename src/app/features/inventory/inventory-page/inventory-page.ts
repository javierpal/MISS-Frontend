import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryApiService } from '../../../core/services/inventory.api.service';
import { InventoryStock, CreateInventoryEntryDto, StockPaginatedResponse, InventoryLot, InventoryQueryParams, InventoryPaginatedResponse } from '../../../core/models/inventory.model';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InventoryAdjustmentDialog } from '../inventory-adjustment-dialog/inventory-adjustment-dialog';
import { InventoryKardexDialog } from '../inventory-kardex-dialog/inventory-kardex-dialog';

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
    MatProgressSpinnerModule, MatPaginatorModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSnackBarModule, MatButtonModule, MatMenuModule, MatDialogModule
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

  // Paginator
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  entryForm!: FormGroup;
  submitting = false;

  // Inventory lots
  inventoryData: InventoryLot[] = [];
  loadingInventory = false;
  inventoryQueried = false;
  inventoryPageSize = 10;
  inventoryPage = 1;
  inventoryTotalItems = 0;
  inventoryNameFilter = '';
  inventoryProductIdFilter = '';



  constructor(
    private cdr: ChangeDetectorRef,
    private inventoryApi: InventoryApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadStock();
    this.loadInventory();
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

  loadStock(page?: number): void {
    this.loading = true;
    const p = page ?? 1;
    this.inventoryApi.getStock({ page: p, limit: this.pageSize }).subscribe({
      next: (res: StockPaginatedResponse) => {
        this.stockData = res.data.map((item: InventoryStock) => ({
          productName: item.product.name,
          sku: item.product.sku,
          totalStock: item.stock,
          lotsActive: item.activeLots,
        }));
        this.totalItems = res.meta.total;
        this.currentPage = res.meta.page;
        this.loading = false;
        this.cdr.markForCheck();
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
        this.loadInventory();
        this.submitting = false;
      },
      error: (err: unknown) => {
        console.error('Error creating entry:', err);
        this.snackBar.open('Error al registrar la entrada', 'Cerrar', { duration: 5000 });
        this.submitting = false;
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

  onPaginate(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadStock(event.pageIndex + 1);
  }

  loadInventory(page?: number): void {
    this.loadingInventory = true;
    const p = page ?? 1;
    const params: InventoryQueryParams = {
      page: p,
      limit: this.inventoryPageSize,
    };
    if (this.inventoryNameFilter) params.name = this.inventoryNameFilter;
    if (this.inventoryProductIdFilter) params.productId = this.inventoryProductIdFilter;

    this.inventoryApi.getInventory(params).subscribe({
      next: (res: InventoryPaginatedResponse) => {
        this.inventoryData = res.data;
        this.inventoryTotalItems = res.meta.total;
        this.inventoryPage = res.meta.page;
        this.inventoryQueried = true;
        this.loadingInventory = false;
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Error loading inventory:', err);
        this.loadingInventory = false;
      },
    });
  }

  onInventoryPaginate(event: PageEvent): void {
    this.inventoryPageSize = event.pageSize;
    this.inventoryPage = event.pageIndex + 1;
    this.loadInventory(this.inventoryPage);
  }

  onApplyInventoryFilters(): void {
    this.inventoryPage = 1;
    this.loadInventory(1);
  }

  onClearInventoryFilters(): void {
    this.inventoryNameFilter = '';
    this.inventoryProductIdFilter = '';
    this.inventoryPage = 1;
    this.loadInventory(1);
  }

  onOpenAdjustment(productId: string | number): void {
    const dialogRef = this.dialog.open(InventoryAdjustmentDialog, {
      width: '400px',
      data: { productId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStock();
        this.loadInventory();
      }
    });
  }

  onOpenKardex(productId: string | number): void {
    this.dialog.open(InventoryKardexDialog, {
      width: '900px',
      maxWidth: '95vw',
      data: { productId },
    });
  }
}
