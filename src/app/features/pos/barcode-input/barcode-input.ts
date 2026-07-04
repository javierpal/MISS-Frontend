import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-barcode-input',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './barcode-input.html',
  styleUrl: './barcode-input.scss',
})
export class BarcodeInput {
  /** Barcode string when Enter is pressed */
  barcodeSubmitted = output<string>();

  /** Signal to open product search with the current barcode text */
  openSearch = output<string>();

  /** Label for the input field */
  label = input<string>('Escanee o escriba el código de barras');

  /** Placeholder text */
  placeholder = input<string>('Escanee código de barras...');

  barcode = '';

  onBarcodeInput(): void {
    // Clear any pending error when user types
  }

  onBarcodeSubmit(): void {
    const barcode = this.barcode.trim();
    if (!barcode) {
      return;
    }
    this.barcodeSubmitted.emit(barcode);
    this.barcode = '';
  }

  onSearchProducts(): void {
    this.openSearch.emit(this.barcode.trim());
  }
}
