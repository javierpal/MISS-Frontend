/** Cash register state */
export interface CashRegister {
  id: string;
  status: CashStatus;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  initialFunds: number;
  expectedFunds: number;
  expectedSales: number;
  actualFunds?: number;
  difference?: number;
  paymentsByMethod?: Record<string, number>;
}

/** Cash movement / transaction */
export interface CashMovement {
  id: string;
  type: MovementType;
  amount: number;
  reason: string;
  reference?: string;
  createdAt: string;
}

/** Cash register status */
export type CashStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

/** Movement type */
export type MovementType = 'IN' | 'OUT' | 'SALE' | 'ADJUSTMENT';

/** DTO to open cash register */
export interface OpenCashDto {
  initialFunds: number;
}

/** DTO to close cash register */
export interface CloseCashDto {
  actualFunds: number;
  note?: string;
}

/** DTO to register a manual movement */
export interface CreateMovementDto {
  type: MovementType;
  amount: number;
  reason: string;
  reference?: string;
}
