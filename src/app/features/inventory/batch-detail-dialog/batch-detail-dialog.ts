import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InventoryLot, InventoryProduct } from '../../../core/models/inventory.model';

export interface BatchDetailData {
  lot: InventoryLot;
}

@Component({
  selector: 'app-batch-detail-dialog',
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  templateUrl: './batch-detail-dialog.html',
  styleUrl: './batch-detail-dialog.scss',
  providers: [DatePipe, DecimalPipe],
})
export class BatchDetailDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BatchDetailData,
    private dialogRef: MatDialogRef<BatchDetailDialog>,
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
