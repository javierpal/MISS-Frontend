import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-content-card',
  imports: [MatCardModule],
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
})
export class ContentCard {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly footer = input<boolean>(false);
}
