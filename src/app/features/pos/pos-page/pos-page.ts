import { Component, OnDestroy, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription, firstValueFrom } from 'rxjs';

import { SearchPopup } from '../search-popup/search-popup';
import { BarcodeInput } from '../barcode-input/barcode-input';
import { CartPanel } from '../cart-panel/cart-panel';
import { PaymentPanel } from '../payment-panel/payment-panel';
import { ProductsApiService } from '../../../core/services/products.api.service';
import { Product } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart-item.model';
import { PaymentEntry } from '../../../core/models/payment.model';
import { SalesApiService } from '../../../core/services/sales.api.service';
import { ApiClientService } from '../../../core/services/api-client.service';
import { CreateSaleDto, RegisterPaymentDto, BackendPaymentMethod, MercadoPagoOrderRequest, MercadoPagoConfirmDto, MixedPaymentEntry } from '../../../core/models/sale.model';
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
  private api = inject(ApiClientService);
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

  // Computed totals — per-line aggregation
  subtotal = computed(() =>
    +(this.cartItems().reduce((sum, item) => sum + item.lineBase, 0)).toFixed(2)
  );

  tax = computed(() =>
    +(this.cartItems().reduce((sum, item) => sum + item.lineTax, 0)).toFixed(2)
  );

  total = computed(() =>
    +(this.cartItems().reduce((sum, item) => sum + item.lineTotal, 0)).toFixed(2)
  );

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

      const unitPrice = product.salePrice;
      const isTaxIncluded = product.pricesIncludeTax ?? false;
      const rate = product.taxRate ?? 0;
      let lineTotal: number, lineBase: number, lineTax: number;
      if (isTaxIncluded) {
        lineTotal = +(unitPrice * newQty).toFixed(2);
        lineBase = +(lineTotal / (1 + rate)).toFixed(2);
        lineTax = +(lineTotal - lineBase).toFixed(2);
      } else {
        lineBase = +(unitPrice * newQty).toFixed(2);
        lineTax = +(lineBase * rate).toFixed(2);
        lineTotal = +(lineBase + lineTax).toFixed(2);
      }
      items[existingIndex] = {
        ...existing,
        quantity: newQty,
        lineTotal,
        lineBase,
        lineTax,
        product: {
          ...existing.product,
          pricesIncludeTax: isTaxIncluded,
          taxRate: rate,
        },
      };
      this.cartItems.set(items);
    } else {
      // Add new item
      const unitPrice = product.salePrice;
      const qty = 1;
      const isTaxIncluded = product.pricesIncludeTax ?? false;
      const rate = product.taxRate ?? 0;
      let lineTotal: number, lineBase: number, lineTax: number;
      if (isTaxIncluded) {
        lineTotal = +(unitPrice * qty).toFixed(2);
        lineBase = +(lineTotal / (1 + rate)).toFixed(2);
        lineTax = +(lineTotal - lineBase).toFixed(2);
      } else {
        lineBase = +(unitPrice * qty).toFixed(2);
        lineTax = +(lineBase * rate).toFixed(2);
        lineTotal = +(lineBase + lineTax).toFixed(2);
      }
      const newItem: CartItem = {
        product: {
          id: product.id,
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          salePrice: unitPrice,
          pricesIncludeTax: isTaxIncluded,
          taxRate: rate,
          currentStock: product.currentStock,
        },
        quantity: qty,
        lineTotal,
        lineBase,
        lineTax,
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
        const unitPrice = item.product.salePrice;
        const isTaxIncluded = item.product.pricesIncludeTax ?? false;
        const rate = item.product.taxRate ?? 0;
        let lineTotal: number, lineBase: number, lineTax: number;
        if (isTaxIncluded) {
          lineTotal = +(unitPrice * quantity).toFixed(2);
          lineBase = +(lineTotal / (1 + rate)).toFixed(2);
          lineTax = +(lineTotal - lineBase).toFixed(2);
        } else {
          lineBase = +(unitPrice * quantity).toFixed(2);
          lineTax = +(lineBase * rate).toFixed(2);
          lineTotal = +(lineBase + lineTax).toFixed(2);
        }
        return {
          ...item,
          quantity,
          lineTotal,
          lineBase,
          lineTax,
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

    async onConfirmPayment(payments: PaymentEntry[] | MixedPaymentEntry): Promise<void> {
    this.processingPayment.set(true);

    const saleDto: CreateSaleDto = {
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.salePrice.toFixed(2),
      })),
    };

    let createdSaleId: string | null = null;
    let createdFolio: string = '';
    let createdSaleTotal: number = 0;

    try {
      const response = await firstValueFrom(this.salesApi.create(saleDto));
      createdSaleId = response?.id ?? null;
      createdFolio = response?.folio ?? '';
      createdSaleTotal = +(response?.total ?? 0);
      if (!createdSaleId) {
        this.snackBar.open('Venta creada pero no se pudo registrar pago', 'Cerrar', { duration: 5000 });
        this.processingPayment.set(false);
        return;
      }
    } catch (err: any) {
      this.snackBar.open('Error al crear venta: ' + (err?.error?.message ?? err.message), 'Cerrar', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.processingPayment.set(false);
      return;
    }

    const paymentArray = Array.isArray(payments) ? payments : [];

    // Check if payment is mixed
    if ((payments as any).kind === 'mixed') {
      await this.handleMixedPayment(createdSaleId, createdFolio, payments as MixedPaymentEntry, createdSaleTotal);
      return;
    }

    // Check if payment is Mercado Pago terminal
    const mpPayment = (Array.isArray(payments) ? payments : []).find(p => p.method === "MERCPAGO");

    if (mpPayment) {
      await this.handleMercadoPagoPayment(createdSaleId, createdFolio, mpPayment, paymentArray);
      return;
    }

    // Regular payment flow (CASH, CARD, TRANSFER)
    const methodMap: Record<string, BackendPaymentMethod | null> = {
      'CASH': 'CASH',
      'CARD': 'CARD',
      'TRANSFER': 'TRANSFER',
    };

    const paymentItems: RegisterPaymentDto["payments"] = [];
    for (const p of paymentArray) {
      const backendMethod = methodMap[p.method];
      if (!backendMethod) {
        this.snackBar.open('Método no soportado: ' + p.method, 'Cerrar', { duration: 5000 });
        this.processingPayment.set(false);
        return;
      }
      const item: any = {
        method: backendMethod,
        amount: p.amount,
        amountReceived: p.amountReceived,
        changeAmount: p.changeAmount,
        status: 'COMPLETED',
      };
      if (p.terminalId) {
        item.terminalId = p.terminalId;
      }
      paymentItems.push(item);
    }

    if (paymentItems.length === 0) {
      this.processingPayment.set(false);
      return;
    }

    const registerPayload: RegisterPaymentDto = {
      saleId: String(createdSaleId),
      payments: paymentItems,
    };

    try {
      await firstValueFrom(this.api.post('sales/payments', registerPayload));
      this.snackBar.open('Venta ' + createdFolio + ' pagada correctamente', 'Cerrar', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.cartItems.set([]);
      this.processingPayment.set(false);
    } catch (err: any) {
      this.snackBar.open('Venta creada (' + createdFolio + ') pero pago falló: ' + (err?.error?.message ?? err.message), 'Cerrar', { duration: 8000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.processingPayment.set(false);
    }
  }

  private async handleMixedPayment(
    saleId: string | null,
    folio: string,
    mixed: MixedPaymentEntry,
    saleTotal: number,
  ): Promise<void> {
    // Derive amounts in integer cents to guarantee exact sum
    const cashCents = Math.round(mixed.cashAmount * 100);
    const mpCents = Math.round(saleTotal * 100) - cashCents;
    const cashAmount = cashCents / 100;
    const mpAmount = mpCents / 100;

    const mixedPayload = {
      saleId: String(saleId),
      payments: [
        { type: 'CASH' as const, amount: cashAmount },
        { type: 'CARD_TERMINAL_MP' as const, amount: mpAmount, terminalId: mixed.terminalId?.trim() },
      ],
    };

    try {
      await firstValueFrom(this.api.post('payments/mixed', mixedPayload));
      this.snackBar.open('Venta ' + folio + ' pagada correctamente (mixto)', 'Cerrar', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.cartItems.set([]);
      this.processingPayment.set(false);
    } catch (err: any) {
      this.snackBar.open('Venta ' + folio + ' creada pero pago mixto falló o quedó pendiente: ' + (err?.error?.message ?? err.message), 'Cerrar', { duration: 8000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.processingPayment.set(false);
    }
  }

  private async handleMercadoPagoPayment(
    saleId: string | null,
    folio: string,
    mpPayment: PaymentEntry,
    allPayments: PaymentEntry[],
  ): Promise<void> {
    const terminalId = mpPayment.terminalId?.trim();
    if (!terminalId) {
      this.snackBar.open('Se requiere ID de terminal para Mercado Pago', 'Cerrar', { duration: 5000 });
      this.processingPayment.set(false);
      return;
    }

    // Step 1: Create Mercado Pago order
    const orderPayload: MercadoPagoOrderRequest = {
      saleId: String(saleId),
      terminalId,
      externalReference: mpPayment.providerReference || undefined,
      amount: mpPayment.amount,
    };

    try {
      const orderResp = await firstValueFrom(this.api.post('payments/mercado-pago/point/order', orderPayload));
      const providerReference = (orderResp as any)?.providerReference ?? (orderResp as any)?.data?.providerReference;
      if (!providerReference) {
        this.snackBar.open('No se obtuvo referencia de orden MP', 'Cerrar', { duration: 5000 });
        this.processingPayment.set(false);
        return;
      }

      // No auto-confirm: payment stays PENDING until real terminal event
      this.snackBar.open('Venta ' + folio + ' pendiente — espera confirmación del terminal MP', 'Cerrar', { duration: 8000, horizontalPosition: 'center', verticalPosition: 'top' });
      this.processingPayment.set(false);
    } catch (err: any) {
      this.snackBar.open('Error orden MP: ' + (err?.error?.message ?? err.message), 'Cerrar', { duration: 5000 });
      this.processingPayment.set(false);
    }
  }

}
