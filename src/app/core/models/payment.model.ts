/** Payment method used in a sale */
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MERCPAGO' | 'OTHER';

/** Single payment in a multi-payment sale */
export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  amountReceived?: number;
  changeAmount?: number;
  status?: string;
  reference?: string;
  provider?: string;
  providerReference?: string;
  terminalId?: string;
  paymentGroupKey?: string;
}

/** DTO to register payment on a sale via POST /sales/payments */
export interface RegisterPaymentDto {
  saleId: string | number;
  payments: PaymentEntry[];
  fiscalPaymentMethod?: string;
  fiscalPaymentForm?: string;
  paymentCompositionSnapshot?: unknown;
}

/** DTO for Mercado Pago confirm */
export interface MercadoPagoConfirmDto {
  providerReference: string;
  status: 'APPROVED' | 'REJECTED';
  amount?: number;
}
