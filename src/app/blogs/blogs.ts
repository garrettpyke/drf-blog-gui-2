import { Component, DestroyRef, inject, signal, computed } from '@angular/core';

import { BlogApiService } from '../services/blog-api.service';

@Component({
  selector: 'app-blogs',
  imports: [],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {
  isFetching = signal(false);
  private blogApiService = inject(BlogApiService);
  private destroyRef = inject(DestroyRef);

  constructor() {}
}
