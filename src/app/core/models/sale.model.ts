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
    unitPrice: number;
  }[];
  payments?: {
    method: SalePaymentMethod;
    amount: number;
    amountReceived?: number;
    changeAmount?: number;
  }[];
}
