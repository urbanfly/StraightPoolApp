import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Straight Pool';

  constructor(private updates: SwUpdate, private snackBar: MatSnackBar, private location: Location) {
    updates.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
      this.snackBar
        .open('An update is available!', 'Update now', { duration: 5000 })
        .onAction()
        .subscribe(() => { window.location.reload(); });
    });
    updates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
  }

  get canGoBack(): boolean {
    return !this.location.isCurrentPathEqualTo('/');
  }

  goBack() {
    this.location.back();
  }
}
