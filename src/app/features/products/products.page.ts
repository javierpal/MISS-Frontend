import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-products-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Products" description="Placeholder para catálogo, altas, edición y segmentación de productos." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPage {}
