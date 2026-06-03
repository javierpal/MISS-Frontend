import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-prescriptions-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Prescriptions" description="Pantalla base para captura, validación y seguimiento de recetas." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrescriptionsPage {}
