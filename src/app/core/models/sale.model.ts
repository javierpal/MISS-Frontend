/** Sale entity for MISS-Frontend */
export interface Sale {
  id: string;
  folio: string;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  costTotal?: number;
  profit?: number;
  payments?: SalePayment[];
  createdAt: string;
  updatedAt?: string;
}

/** Sale line item */
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Sale payment record */
export interface SalePayment {
  id: string;
  method: string;
  amount: number;
  status?: string;
  reference?: string;
}

/** Sale status values */
export type SaleStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

/** Payment method used in a sale */
export type SalePaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MERCPAGO' | 'OTHER';

/** DTO to create a sale via POST /sales */
export interface CreateSaleDto {
  items: {
    productId: string | number;
    quantity: number;
    unitPrice: string;
  }[];
  payments?: {
    method: SalePaymentMethod;
    amount: number;
    amountReceived?: number;
    changeAmount?: number;
  }[];
}

/** Backend payment method enum-like type */
export type BackendPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED' | 'CARD_TERMINAL_MP';

/** DTO for POST /sales/payments */
export interface RegisterPaymentDto {
  saleId: string;
  payments: {
    method: BackendPaymentMethod;
    amount: number;
    amountReceived?: number;
    changeAmount?: number;
    status: 'COMPLETED';
    reference?: string;
    provider?: 'MERCADO_PAGO';
    providerReference?: string;
    terminalId?: string;
    paymentGroupKey?: string;
    requestPayloadHash?: string;
  }[];
}

/** Mercado Pago order request */
export interface MercadoPagoOrderRequest {
  saleId: string;
  terminalId: string;
  externalReference?: string;
  amount?: number;
}

/** Mercado Pago confirmation request */
export enum MercadoPagoConfirmationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface MercadoPagoConfirmDto {
  providerReference: string;
  status: MercadoPagoConfirmationStatus;
  amount?: number;
}

/** Emitted by payment-panel when user activates mixed payment mode */
export interface MixedPaymentEntry {
  kind: 'mixed';
  cashAmount: number;
  cashReceived: number;
  mpAmount: number;
  terminalId: string;
}
