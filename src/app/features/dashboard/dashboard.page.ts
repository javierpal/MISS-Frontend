import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Dashboard" description="Punto de entrada para métricas, widgets y alertas operativas de MISS." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {}
