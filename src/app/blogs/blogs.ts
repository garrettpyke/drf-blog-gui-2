import { Component, DestroyRef, inject, signal, computed } from '@angular/core';

import { BlogApiService } from '../services/blog-api.service';
import { Blog } from './blog/blog';

@Component({
  selector: 'app-blogs',
  imports: [Blog],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {
  isFetching = signal(false);
  private blogApiService = inject(BlogApiService);
  private destroyRef = inject(DestroyRef);
  blogs = this.blogApiService.loadedBlogs;

  constructor() {}

  ngOnInit(): void {
    this.isFetching.set(true); // todo: add elements to template to reflect this

    const subscription = this.blogApiService.loadBlogs().subscribe({
      error: (error: Error) => {
        console.log(error);
      },
      complete: () => {
        this.isFetching.set(false);
        console.log(this.blogs());
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
