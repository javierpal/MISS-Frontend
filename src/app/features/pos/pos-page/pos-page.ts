import { Component, OnDestroy, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { SearchPopup } from '../search-popup/search-popup';
import { BarcodeInput } from '../barcode-input/barcode-input';
import { CartPanel } from '../cart-panel/cart-panel';
import { PaymentPanel } from '../payment-panel/payment-panel';
import { ProductsApiService } from '../../../core/services/products.api.service';
import { Product } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart-item.model';
import { PaymentEntry } from '../../../core/models/payment.model';
import { SalesApiService } from '../../../core/services/sales.api.service';
import { CreateSaleDto } from '../../../core/models/sale.model';
import { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    BarcodeInput,
    CartPanel,
    PaymentPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.scss',
})
export class PosPage implements OnDestroy {
  private salesApi = inject(SalesApiService);
  private productsApi = inject(ProductsApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private subscriptions = new Subscription();

  // Cart state
  cartItems = signal<CartItem[]>([]);

  // Loading states
  processingPayment = signal(false);


  // Barcode error state
  barcodeError = signal<string | null>(null);

  // Computed totals
  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  taxRate = 0.16;

  tax = computed(() => +(this.subtotal() * this.taxRate).toFixed(2));

  total = computed(() => +(this.subtotal() + this.tax()).toFixed(2));

  // Payment panel data
  paymentData = computed(() => ({
    total: this.total(),
    subtotal: this.subtotal(),
    tax: this.tax(),
  }));

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Open search popup with optional initial query
  openSearchPopup(initialQuery: string = ''): void {
    const dialogRef = this.dialog.open(SearchPopup, {
      width: '600px',
      maxHeight: '80vh',
      data: { initialQuery },
      panelClass: 'pos-search-dialog',
    });

    dialogRef.afterClosed().subscribe((product: Product | undefined) => {
      if (product) {
        this.onProductSelected(product);
      }
    });
  }

  // Barcode input handler - distinguish barcode vs text
  onBarcodeSubmitted(barcode: string): void {
    this.barcodeError.set(null);

    if (this._isLikelyBarcode(barcode)) {
      // Treat as barcode: search and add directly if found
      this.productsApi.search({ search: barcode, limit: 1 }).subscribe({
        next: (res) => {
          if (res.items.length > 0) {
            this.onProductSelected(res.items[0]);
          } else {
            this.barcodeError.set(`No se encontró ningún producto con el código de barras: ${barcode}`);
          }
        },
        error: () => {
          this.barcodeError.set('Error al buscar el código de barras');
        },
      });
    } else {
      // Treat as text/name: open popup with auto-search
      this.openSearchPopup(barcode);
    }
  }

  // Heuristic: a string is likely a barcode if it's all digits and 8-14 chars
  private _isLikelyBarcode(value: string): boolean {
    return /^\d{8,14}$/.test(value);
  }

  // Product selection from search bar
  onProductSelected(product: Product): void {
    const existingIndex = this.cartItems().findIndex(
      (item) => item.product.id === product.id
    );

    if (existingIndex >= 0) {
      // Update existing item quantity
      const items = [...this.cartItems()];
      const existing = items[existingIndex];
      const newQty = existing.quantity + 1;

      // Check stock
      if (product.currentStock !== undefined && newQty > product.currentStock) {
        this.snackBar.open(
          `Stock insuficiente para ${product.name}`,
          'Cerrar',
          { duration: 3000 }
        );
        return;
      }

      items[existingIndex] = {
        ...existing,
        quantity: newQty,
        lineTotal: +(newQty * product.salePrice).toFixed(2),
      };
      this.cartItems.set(items);
    } else {
      // Add new item
      const newItem: CartItem = {
        product: {
          id: product.id,
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          salePrice: product.salePrice,
          currentStock: product.currentStock,
        },
        quantity: 1,
        lineTotal: product.salePrice,
      };
      this.cartItems.set([...this.cartItems(), newItem]);
    }
  }

  // Cart operations
  onRemoveItem(productId: string): void {
    const items = this.cartItems().filter((item) => item.product.id !== productId);
    this.cartItems.set(items);
  }

  onCartUpdateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.onRemoveItem(productId);
      return;
    }

    const items = this.cartItems().map((item) => {
      if (item.product.id === productId) {
        // Find original product to check stock
        const product = this.cartItems().find(
          (p) => p.product.id === productId
        )?.product;
        if (product && product.currentStock !== undefined && quantity > product.currentStock) {
          this.snackBar.open(
            `Stock insuficiente`,
            'Cerrar',
            { duration: 3000 }
          );
          return item;
        }
        return {
          ...item,
          quantity,
          lineTotal: +(quantity * item.product.salePrice).toFixed(2),
        };
      }
      return item;
    });
    this.cartItems.set(items);
  }

  onClearCart(): void {
    this.cartItems.set([]);
  }

  // Payment flow
  // Payment panel is always visible now; this handler is kept as no-op
  // in case the flow needs to be restructured later.
  onConfirmCart(): void {
    // no-op — payment panel is always rendered
  }

  onConfirmPayment(payments: PaymentEntry[]): void {
    this.processingPayment.set(true);

    const saleDto: CreateSaleDto = {
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
      })),
      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        amountReceived: p.amountReceived,
        changeAmount: p.changeAmount,
      })),
    };

    const sub = this.salesApi.create(saleDto).subscribe({
      next: (response: any) => {
        this.snackBar.open(
          `Venta registrada: ${response?.data?.folio ?? 'OK'}`,
          'Cerrar',
          { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' }
        );
        // Reset everything
        this.cartItems.set([]);
        this.processingPayment.set(false);
      },
      error: (error: any) => {
        this.snackBar.open(
          `Error al registrar venta: ${error?.error?.message ?? error.message}`,
          'Cerrar',
          { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' }
        );
        this.processingPayment.set(false);
      },
    });

    this.subscriptions.add(sub);
  }
}
