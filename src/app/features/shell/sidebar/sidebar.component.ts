import {
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  host: {
    '[class.sidebar--collapsed]': 'isCollapsed',
    '[class.sidebar--mobile-open]': 'isMobileOpen',
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly collapsed = input<boolean>(false);
  readonly mobileOpen = input<boolean>(false);

  readonly collapseChange = output<boolean>();

  get isCollapsed(): boolean {
    return this.collapsed();
  }

  get isMobileOpen(): boolean {
    return this.mobileOpen();
  }
}
