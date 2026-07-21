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
  openingAmount: number;
}

/** DTO to close cash register */
export interface CloseCashDto {
  closingAmount: number;
}

/** DTO to register a manual movement */
export interface CreateMovementDto {
  type: MovementType;
  amount: number;
  reason: string;
  referenceType: 'SALE' | 'MANUAL' | 'ADJUSTMENT';
  referenceId?: string;
}

/** Cash report summary */
export interface CashReport {
  sessionId: string;
  date: string;
  openingFunds: number;
  totalSales: number;
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  expectedFunds: number;
  actualFunds?: number;
  difference?: number;
  paymentsByMethod: Record<string, number>;
  movements: CashMovement[];
}

/** Session summary for cash register */
export interface CashSessionSummary {
  sessionId: string;
  status: CashStatus;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  cashSalesTotal: number;
  totalSales: number;
  manualInTotal: number;
  manualOutTotal: number;
  automaticSalesMovementTotal: number;
  expectedAmount: number;
  closingAmount?: number;
  difference?: number;
  salesCount: number;
  cashPaymentsCount: number;
  manualMovementsCount: number;
}

/** User info embedded in cash session */
export interface CashSessionUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

/** Internal session model from GET /cash/current */
export interface CashSession {
  id: string;
  status: CashStatus;
  userId: string;
  user?: CashSessionUser;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
}

/** Response from GET /cash/current */
export interface CashCurrentResponse {
  session: CashSession | null;
  summary?: CashSessionSummary;
}
