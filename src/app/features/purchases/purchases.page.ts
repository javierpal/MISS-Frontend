import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-purchases-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Compras" description="Órdenes de compra, recepción e ingreso a inventario." />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasesPage {}
