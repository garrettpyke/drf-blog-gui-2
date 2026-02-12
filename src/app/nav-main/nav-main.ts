import { Component, output } from '@angular/core';

import { Blogs } from '../blogs/blogs';
import { Toolbar } from '../shared/toolbar/toolbar';

@Component({
  selector: 'app-nav-main',
  imports: [Toolbar, Blogs],
  templateUrl: './nav-main.html',
  styleUrl: './nav-main.css',
})
export class NavMain {
  signOut = output<void>();

  onClickSignOut() {
    this.signOut.emit();
  }

  onClickNewBlog() {
    // if (this.blogApiService.currentUser()) {
    //   this.newBlogSubmission = true;
    //   return;
    // }
    // console.log('Ya gotta be logged in to post a new blog!'); // todo
  }
}
