import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPageComponent } from '../../shared/components/placeholder-page.component';

@Component({
  selector: 'app-users-page',
  imports: [PlaceholderPageComponent],
  template: `<app-placeholder-page title="Users" description="Placeholder para gestión de usuarios, roles y permisos internos." />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage {}
