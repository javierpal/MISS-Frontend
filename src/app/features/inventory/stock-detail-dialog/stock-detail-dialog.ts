import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface StockDetailData {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  lotsActive: number;
}

@Component({
  selector: 'app-stock-detail-dialog',
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  templateUrl: './stock-detail-dialog.html',
  styleUrl: './stock-detail-dialog.scss',
  providers: [DatePipe, DecimalPipe],
})
export class StockDetailDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StockDetailData,
    private dialogRef: MatDialogRef<StockDetailDialog>,
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
