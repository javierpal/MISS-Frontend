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
  readonly confirmPayment = output<PaymentEntry[]>();

  /** Currently selected payment method */
  readonly selectedMethod = signal<PaymentMethod>('CASH');

  /** Amount received (for cash payments) */
  readonly amountReceived = signal<number | null>(null);

  /** Payment reference (for card/transfer) */
  readonly reference = signal('');

  /** Provider reference (for Mercado Pago) */
  readonly providerReference = signal('');

  /** Available payment methods */
  readonly methods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'CASH', label: 'Efectivo', icon: 'payments' },
    { value: 'CARD', label: 'Tarjeta', icon: 'credit_card' },
    { value: 'TRANSFER', label: 'Transferencia', icon: 'account_balance' },
    { value: 'MERCPAGO', label: 'Mercado Pago', icon: 'account_balance_wallet' },
    { value: 'OTHER', label: 'Otro', icon: 'more_horiz' },
  ];

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
      }
    });
  }

  onMethodChange(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.amountReceived.set(0);
    this.reference.set('');
    this.providerReference.set('');
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


  onConfirm(): void {
    const entry: PaymentEntry = {
      method: this.selectedMethod(),
      amount: this.data().total,
      amountReceived: this.selectedMethod() === 'CASH' ? this.amountReceived() ?? 0 : undefined,
      changeAmount: this.change(),
      reference: this.reference() || undefined,
      providerReference: this.providerReference() || undefined,
      status: 'APPROVED',
    };
    this.confirmPayment.emit([entry]);
  }
}
