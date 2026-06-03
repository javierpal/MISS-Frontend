import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-cash-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Cash" description="Placeholder para cortes, movimientos de caja y conciliación diaria." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashPage {}
