import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-settings-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Configuración" description="Ajustes generales del sistema MISS." />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
