import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatInputModule, MatCardModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    BrowserAnimationsModule,
    MatCardModule
  ],
  exports: [
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    BrowserAnimationsModule,
    MatCardModule
  ],
  declarations: []
})
export class MaterialModule { }
