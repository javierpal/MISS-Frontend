import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-reports-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Reports" description="Base para reportes operativos, exportables y filtros analíticos." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPage {}
