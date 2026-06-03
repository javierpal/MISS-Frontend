import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-consumption-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Consumo interno" description="Registro y consulta de consumo interno de inventario." />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionPage {}
