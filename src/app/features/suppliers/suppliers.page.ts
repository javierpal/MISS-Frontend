import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-suppliers-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Proveedores" description="Catálogo de proveedores, datos de contacto y gestión." />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersPage {}
