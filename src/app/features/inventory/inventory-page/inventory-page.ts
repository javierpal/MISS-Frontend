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
import { InventoryStock, StockPaginatedResponse, InventoryLot, InventoryQueryParams, InventoryPaginatedResponse } from '../../../core/models/inventory.model';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InventoryAdjustmentDialog } from '../inventory-adjustment-dialog/inventory-adjustment-dialog';
import { InventoryKardexDialog } from '../inventory-kardex-dialog/inventory-kardex-dialog';
import { InventoryEntryDialog } from '../inventory-entry-dialog/inventory-entry-dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { BatchDetailDialog } from '../batch-detail-dialog/batch-detail-dialog';
import { StockDetailDialog } from '../stock-detail-dialog/stock-detail-dialog';

interface StockRow {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  lotsActive: number;
}

@Component({
  selector: 'app-inventory-page',
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatPaginatorModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSnackBarModule, MatButtonModule, MatMenuModule, MatDialogModule, ClipboardModule
  ],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.scss',
})
export class InventoryPage implements OnInit {
  // Column definitions - desktop (full)
  readonly stockColumnsDesktop = ['productName', 'sku', 'totalStock', 'status', 'lotsActive'];
  readonly stockColumnsMobile = ['productName', 'totalStock', 'actions'];

  readonly inventoryColumnsDesktop = ['productId', 'productName', 'sku', 'batchNumber', 'expirationDate', 'quantityReceived', 'quantityAvailable', 'unitCost', 'receivedAt', 'actions'];
  readonly inventoryColumnsMobile = ['productId', 'productName', 'actions'];

  // Responsive columns
  stockColumns: string[] = [];
  inventoryColumns: string[] = [];

  // Clipboard
  copiedProductId = '';

  get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.Handset]);
  }

  stockData: StockRow[] = [];
  loading = false;

  // Paginator
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  // Stock filters
  stockNameFilter = '';
  stockProductIdFilter = '';

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
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.updateColumns();
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.stockColumns = this.stockColumnsMobile;
        this.inventoryColumns = this.inventoryColumnsMobile;
      } else {
        this.stockColumns = this.stockColumnsDesktop;
        this.inventoryColumns = this.inventoryColumnsDesktop;
      }
      this.cdr.markForCheck();
    });
    this.loadStock();
    this.loadInventory();
  }

  loadStock(page?: number): void {
    this.loading = true;
    const p = page ?? 1;
    const params: any = { page: p, limit: this.pageSize };
    if (this.stockNameFilter) params.name = this.stockNameFilter;
    if (this.stockProductIdFilter) params.productId = this.stockProductIdFilter;

    this.inventoryApi.getStock(params).subscribe({
      next: (res: StockPaginatedResponse) => {
        this.stockData = res.data.map((item: InventoryStock) => ({
          productName: item.product.name,
          sku: item.product.sku,
          totalStock: item.stock,
          lotsActive: item.activeLots,
          productId: item.product.id,
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

  onApplyStockFilters(): void {
    this.currentPage = 1;
    this.loadStock(1);
  }

  onClearStockFilters(): void {
    this.stockNameFilter = '';
    this.stockProductIdFilter = '';
    this.currentPage = 1;
    this.loadStock(1);
  }

  onOpenEntry(): void {
    const dialogRef = this.dialog.open(InventoryEntryDialog, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStock();
        this.loadInventory();
      }
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
      maxHeight: '90vh',
      panelClass: 'kardex-dialog-panel',
      data: { productId },
    });
  }


  onOpenBatchDetail(lot: InventoryLot): void {
    this.dialog.open(BatchDetailDialog, {
      width: '600px',
      maxWidth: '95vw',
      height: 'auto',
      data: { lot },
    });
  }

  copyToClipboard(productId: string | number): void {
    this.copiedProductId = String(productId);
    this.snackBar.open('Product ID copiado', 'Cerrar', { duration: 2000 });

  }

  onOpenStockDetail(row: StockRow): void {
    this.dialog.open(StockDetailDialog, {
      width: '450px',
      maxWidth: '95vw',
      data: {
        productId: row.productId,
        productName: row.productName,
        sku: row.sku,
        totalStock: row.totalStock,
        lotsActive: row.lotsActive,
      },
    });
  }

  private updateColumns(): void {
    const isMobile = this.breakpointObserver.isMatched([Breakpoints.Handset]);
    if (isMobile) {
      this.stockColumns = this.stockColumnsMobile;
      this.inventoryColumns = this.inventoryColumnsMobile;
    } else {
      this.stockColumns = this.stockColumnsDesktop;
      this.inventoryColumns = this.inventoryColumnsDesktop;
    }
  }
}
