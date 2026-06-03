import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-pos-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="POS" description="Espacio inicial para caja rápida, búsqueda de productos y flujo de venta." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosPage {}
