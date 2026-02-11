import { Component, output } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  newBlog = output<boolean>();
  logout = output<void>();

  onClickLogout() {
    // console.log('Toolbar: Logout clicked');
    this.logout.emit();
  }

  onClickNewBlog() {
    // console.log('New Blog clicked');
    this.newBlog.emit(true);
  }
}
