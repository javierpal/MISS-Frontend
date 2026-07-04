/** Single item in the POS cart */
export interface CartItem {
  product: {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    salePrice: number;
    pricesIncludeTax?: boolean;
    taxRate?: number;
    currentStock?: number;
  };
  quantity: number;
  lineTotal: number;
  lineBase: number;
  lineTax: number;
}
