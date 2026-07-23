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

// === Admin endpoints models ===

/** Admin session list item */
export interface AdminSessionItem {
  id: string;
  status: CashStatus;
  userId: string;
  user?: CashSessionUser;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  summary?: AdminSessionSummary;
}

/** Admin session summary (lighter than CashSessionSummary) */
export interface AdminSessionSummary {
  expectedAmount: number;
  cashSalesTotal: number;
  manualInTotal: number;
  manualOutTotal: number;
  difference?: number;
  salesCount: number;
  manualMovementsCount: number;
}

/** Backend pagination meta */
export interface AdminPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response from GET /cash/admin/sessions/open */
export interface AdminSessionsOpenResponse {
  data: AdminSessionItem[];
  meta: AdminPaginationMeta;
}

/** Response from GET /cash/admin/sessions/:sessionId */
export interface AdminSessionDetailResponse {
  id: string;
  status: CashStatus;
  userId: string;
  user?: CashSessionUser;
  openingAmount: number;
  openedAt: string;
  closedAt?: string;
  summary: AdminSessionSummary;
  movements?: CashMovement[];
  sales?: Array<{
    id: string;
    total: number;
    reference?: string;
    createdAt: string;
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    createdAt: string;
  }>;
}

/** DTO for POST /cash/admin/sessions/:sessionId/movements */
export interface AdminCreateMovementDto {
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
}
