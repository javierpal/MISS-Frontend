import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-billing-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Billing" description="Vista inicial para CFDI, facturación y estatus de documentos." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingPage {}
