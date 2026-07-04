import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  computed,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { PaymentMethod, PaymentEntry } from '../../../core/models/payment.model';
import { MixedPaymentEntry } from '../../../core/models/sale.model';

export interface PaymentPanelData {
  total: number;
  subtotal: number;
  tax: number;
}

@Component({
  selector: 'app-payment-panel',
  imports: [FormsModule, MatIconModule, MatButtonModule, MatInputModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-panel.html',
  styleUrl: './payment-panel.scss',
})
export class PaymentPanel {
  /** Total amount to pay */
  readonly data = input.required<PaymentPanelData>();

  /** Emitted when user confirms payment */
  readonly confirmPayment = output<PaymentEntry[] | MixedPaymentEntry>();

  /** Currently selected payment method */
  readonly selectedMethod = signal<PaymentMethod>('CASH');

  /** Amount received (for cash payments) */
  readonly amountReceived = signal<number | null>(null);

  /** Payment reference (for card/transfer) */
  readonly reference = signal('');

  /** Provider reference (for Mercado Pago) */
  readonly providerReference = signal('');

  // === Mixed payment UI state ===
  readonly enableMixed = signal(false);
  readonly mixedCashAmount = signal(0);
  readonly mixedCashReceived = signal(0);
  readonly mixedMpAmount = computed(() => {
    const totalCents = Math.round(this.data().total * 100);
    const cashCents = Math.round(this.mixedCashAmount() * 100);
    const mpCents = totalCents - cashCents;
    return Math.max(0, mpCents / 100);
  });

  readonly mixedChange = computed(() => this.mixedCashReceived() - this.mixedCashAmount());
  readonly mixedTotal = computed(() => this.mixedCashAmount() + this.mixedMpAmount());
  private centsEqual(a: number, b: number): boolean {
    return Math.abs(Math.round(a * 100) - Math.round(b * 100)) <= 1;
  }

  readonly mixedValid = computed(() => {
    if (!this.enableMixed()) return false;
    return this.centsEqual(this.mixedTotal(), this.data().total) &&
      this.mixedCashReceived() >= this.mixedCashAmount() &&
      this.mixedCashAmount() > 0 &&
      this.mixedMpAmount() > 0 &&
      this.terminalId().trim().length > 0;
  });

  /** Terminal ID (for Mercado Pago terminal) */
  readonly terminalId = signal('');

  /** Available payment methods */
  readonly methods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'CASH', label: 'Efectivo', icon: 'payments' },
    // TODO: re-enable when backend integration is ready
    // { value: 'CARD', label: 'Tarjeta', icon: 'credit_card' },
    // { value: 'TRANSFER', label: 'Transferencia', icon: 'account_balance' },
    { value: 'MERCPAGO', label: 'Mercado Pago', icon: 'account_balance_wallet' },
    // { value: 'OTHER', label: 'Otro', icon: 'more_horiz' },
  ];

  /** Mexican common denominations */
  readonly denominations: number[] = [20, 50, 100, 200, 500, 1000];

  /** Calculated change (only for CASH) */
  readonly change = computed(() => {
    if (this.selectedMethod() !== 'CASH') return 0;
    const received = this.amountReceived() ?? 0;
    if (received < this.data().total) return 0;
    return +(received - this.data().total).toFixed(2);
  });

  /** Whether the received amount is sufficient (for cash) */
  readonly isSufficient = computed(() => {
    if (this.selectedMethod() !== 'CASH') return true;
    return (this.amountReceived() ?? 0) >= this.data().total;
  });

  /** Whether the form is ready to submit */
  readonly canSubmit = computed(() => {
    if (this.enableMixed()) return this.mixedValid();
    if (this.selectedMethod() === 'CASH') {
      return this.isSufficient();
    }
    return true;
  });

  constructor() {
    effect(() => {
      // Reset received amount when method changes
      if (this.selectedMethod() !== 'CASH') {
        this.amountReceived.set(0);
        this.reference.set('');
        this.providerReference.set('');
        this.terminalId.set('');
      }
      // Reset mixed when switching away
      if (this.selectedMethod() !== 'CASH' && !this.enableMixed()) {
        this.enableMixed.set(false);
        this.mixedCashAmount.set(0);
        this.mixedCashReceived.set(0);
      }
    });
  }

  toggleMixed(): void {
    this.enableMixed.set(!this.enableMixed());
    if (this.enableMixed()) {
      this.selectedMethod.set('CASH');
    }
  }

  onMethodChange(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.amountReceived.set(0);
    this.reference.set('');
    this.providerReference.set('');
    this.terminalId.set('');
  }

  onDenominationClick(amount: number): void {
    this.amountReceived.set(amount);
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === "" || value === null) {
      this.amountReceived.set(null);
    } else {
      this.amountReceived.set(parseFloat(value));
    }
  }



  getMixedErrors(): string[] {
    const errors: string[] = [];
    if (!this.enableMixed()) return errors;
    if (!this.centsEqual(this.mixedTotal(), this.data().total)) {
      errors.push('El monto debe sumar el total de la venta');
    }
    if (this.mixedCashAmount() <= 0 || this.mixedMpAmount() <= 0) {
      errors.push('Ambos montos deben ser mayores a cero');
    }
    if (this.mixedCashReceived() < this.mixedCashAmount()) {
      errors.push('El efectivo recibido debe ser mayor o igual al monto');
    }
    if (this.terminalId().trim().length === 0) {
      errors.push('El ID de terminal es obligatorio');
    }
    return errors;
  }

  onConfirm(): void {
    if (this.enableMixed()) {
      const mixedEntry: MixedPaymentEntry = {
        kind: 'mixed',
        cashAmount: this.mixedCashAmount(),
        cashReceived: this.mixedCashReceived(),
        mpAmount: this.mixedMpAmount(),
        terminalId: this.terminalId(),
      };
      this.confirmPayment.emit(mixedEntry);
      return;
    }
    const entry: PaymentEntry = {
      method: this.selectedMethod(),
      amount: this.data().total,
      amountReceived: this.selectedMethod() === 'CASH' ? this.amountReceived() ?? 0 : undefined,
      changeAmount: this.change(),
      reference: this.reference() || undefined,
      providerReference: this.providerReference() || undefined,
      terminalId: this.terminalId() || undefined,
      status: 'APPROVED',
    };
    this.confirmPayment.emit([entry]);
  }
}
