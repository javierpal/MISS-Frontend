import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-sales-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Ventas" description="Historial de ventas, filtros y detalle de transacciones." />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {}
