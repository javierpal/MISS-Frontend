import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-inventory-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Inventory" description="Base para stock, ajustes, conteos cíclicos y trazabilidad de inventario." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryPage {}
