import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { ThemeService } from '../../../core/theme/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly title = input<string>('');
  readonly mobileMenuOpen = input<boolean>(false);
  readonly menuToggle = output<boolean>();

  protected userName(): string {
    const user = this.authService.getUser();
    return user ? user.name : 'Usuario';
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
