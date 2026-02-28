import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';

import { BlogApiService } from '../services/blog-api.service';
import { Blog } from './blog/blog';
import { type Blog as BlogModel } from '../models/blog.model';

@Component({
  selector: 'app-blogs',
  imports: [Blog, RouterLink, MatIcon, MatChipsModule],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {
  isFetching = signal(false);
  private blogApiService = inject(BlogApiService);
  private destroyRef = inject(DestroyRef);
  blogs = signal<BlogModel[]>([]);
  categories = computed(() => this.blogApiService.loadedCategories());
  authors = computed(() => this.blogApiService.loadedAuthors());

  ngOnInit(): void {
    this.isFetching.set(true);

    const subscription = this.blogApiService.loadBlogs().subscribe({
      error: (error: Error) => {
        console.log(error);
      },
      complete: () => {
        this.blogs.set(this.blogApiService.loadedBlogs()!);
        this.isFetching.set(false);
        console.log(this.blogs());
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  getAuthorEmail(authorId: number): string {
    const user = this.authors().find((author) => author.id === authorId);
    return user?.email || 'Author not found!';
  }

  getCategoryDesc(categoryId: number): string {
    const category = this.categories().find((cat) => cat.id === categoryId);
    const desc = category?.genre ? `${category?.subject} - ${category?.genre}` : category?.subject;
    return desc || 'uncategorized';
  }

  // onClickBlog(blogId: number) {
  // const subscription = this.blogApiService.loadBlogDetail(blogId).subscribe({
  //   error: (error: Error) => {
  //     console.log(error);
  //   },
  //   complete: () => {
  //     console.log('done');
  //   },
  // });
  // this.destroyRef.onDestroy(() => {
  //   subscription.unsubscribe();
  // });
  // }
}
