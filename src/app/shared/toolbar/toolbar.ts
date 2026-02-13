import { Component, output } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  newBlog = output<boolean>();
  signOut = output<void>();

  onClickSignout() {
    // console.log('Toolbar: Logout clicked');
    this.signOut.emit();
  }

  onClickNewBlog() {
    // console.log('New Blog clicked');
    this.newBlog.emit(true);
  }
}
