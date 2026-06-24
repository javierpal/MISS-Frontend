import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryApiService } from '../../core/services/inventory.api.service';
import { InventoryStock } from '../../core/models/inventory.model';

interface StockRow {
  productName: string;
  sku: string;
  totalStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lotsActive: number;
  nextExpiry?: string;
}

@Component({
  selector: 'app-inventory-page',
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.scss',
})
export class InventoryPage implements OnInit {
  displayedColumns: string[] = [
    'productName', 'sku', 'totalStock', 'lowStockThreshold',
    'status', 'lotsActive', 'nextExpiry'
  ];
  stockData: StockRow[] = [];
  loading = false;

  constructor(private inventoryApi: InventoryApiService) {}

  ngOnInit(): void {
    this.loadStock();
  }

  loadStock(): void {
    this.loading = true;
    this.inventoryApi.getStock().subscribe({
      next: (data) => {
        this.stockData = data.map((item) => ({
          productName: item.productName,
          sku: item.sku,
          totalStock: item.totalStock,
          lowStockThreshold: item.lowStockThreshold,
          isLowStock: item.isLowStock,
          isOutOfStock: item.isOutOfStock,
          lotsActive: item.lots.filter((l) => l.isActive).length,
          nextExpiry: item.nextExpiryDate,
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading inventory stock:', err);
        this.loading = false;
      },
    });
  }

  getStatusColor(row: StockRow): string {
    if (row.isOutOfStock) return '#f44336';
    if (row.isLowStock) return '#ff9800';
    return '#4caf50';
  }

  getStatusText(row: StockRow): string {
    if (row.isOutOfStock) return 'Sin stock';
    if (row.isLowStock) return 'Stock bajo';
    return 'Normal';
  }
}
