export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiErrorResponse;
  message?: string;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface HttpParamsExtended {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryEntry {
  id: string;
  productId: string;
  type: 'entry' | 'output' | 'adjustment';
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface SaleResponse {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface PaymentResponse {
  id: string;
  saleId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface CashResponse {
  id: string;
  openingAmount: number;
  currentAmount: number;
  movements: CashMovement[];
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface CashMovement {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface PrescriptionResponse {
  id: string;
  patientName: string;
  doctor: string;
  status: string;
  publicId: string;
  createdAt: string;
}

export interface BillingInvoice {
  id: string;
  saleId?: string;
  status: string;
  total: number;
  uuid?: string;
  createdAt: string;
}

export interface DashboardKpi {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
}

export interface DashboardKpiAdvanced {
  metrics: DashboardKpi[];
  charts: ChartData[];
}

export interface ChartData {
  type: string;
  label: string;
  data: number[];
  labels?: string[];
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface InternalConsumptionEntry {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export interface PurchaseResponse {
  id: string;
  supplierId: string;
  total: number;
  status: string;
  items: PurchaseItem[];
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplierResponse {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface AlertResponse {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface LooseProductConvert {
  productId: string;
  quantity: number;
  unitFrom: string;
  unitTo: string;
}
