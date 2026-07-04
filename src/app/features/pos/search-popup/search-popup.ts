import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { ProductSearchBar } from '../product-search-bar/product-search-bar';
import { Product } from '../../../core/models/product.model';

interface DialogData {
  initialQuery?: string;
}

@Component({
  selector: 'app-search-popup',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ProductSearchBar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-popup.html',
  styleUrl: './search-popup.scss',
})
export class SearchPopup implements OnInit, AfterViewInit {
  private dialogRef = inject(MatDialogRef<SearchPopup>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);

  searchQuery = '';
  searchInputRef = viewChild<Element>('searchInput');

  ngOnInit(): void {
    this.searchQuery = this.data.initialQuery ?? '';
  }

  ngAfterViewInit(): void {
    // Focus the input after the dialog opens (deferred to avoid CD issues)
    setTimeout(() => {
      const el = this.searchInputRef();
      if (el && typeof (el as HTMLElement).focus === 'function') {
        (el as HTMLElement).focus();
      }
    });
  }

  selectProduct(product: Product): void {
    this.dialogRef.close(product);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
