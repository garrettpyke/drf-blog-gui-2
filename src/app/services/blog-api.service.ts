import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type Blog } from '../models/blog.model';
import { type BlogDetail } from '../models/blog-detail.model';
import { type BlogVoteDetail } from '../models/blog-vote-detail.model';
import { type Category } from '../models/category.model';
import { type Comment } from '../models/comment.model';
import { type User } from '../models/user.model';
import { type NewBlogModel } from '../models/new-blog.model';
import { type Vote } from '../models/vote.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' })
export class BlogApiService {
  private httpClient = inject(HttpClient);
  private userApiService = inject(UserApiService);
  private blogs = signal<Blog[]>([]);
  private blogDetail = signal<BlogDetail | undefined>(undefined);
  private blogVoteDetail = signal<BlogVoteDetail | undefined>(undefined);
  private categories = signal<Category[]>([]);
  private destroyRef = inject(DestroyRef);
  private apiUrl = environment.apiUrl;

  user = signal<User>(this.userApiService.currentUser()!);
  loadedBlogs = this.blogs.asReadonly();
  loadedBlogDetail = this.blogDetail.asReadonly();
  loadedBlogVoteDetail = this.blogVoteDetail.asReadonly();
  loadedCategories = this.categories.asReadonly();
  loadedAuthors = computed(
    () => this.userApiService.loadedUsers(),
    // this.userApiService.loadedUsers().map((author) => [author.id, author.email]), //* typescript tuple
  );

  constructor() {
    const categorySubscription = this.loadCategories().subscribe({
      error: (error: Error) => {
        console.error('Error loading categories', error);
      },
      complete: () => {
        console.log('Category loading completed');
        // console.log(this.loadedCategories());
      },
    });
    this.destroyRef.onDestroy(() => categorySubscription.unsubscribe());

    const authorSubscription = this.userApiService.fetchUsers().subscribe({
      error: (error: Error) => {
        console.error('Error loading authors:', error);
      },
      complete: () => {
        console.log('Author loading completed');
        // console.log(this.loadedAuthors());
      },
    });
    this.destroyRef.onDestroy(() => authorSubscription.unsubscribe());
  }

  private verifyToken(): string {
    const { token } = this.userApiService.currentUser()!;
    if (token) {
      return token;
    }
    return '';
  }

  private fetchBlogs(url: string, errMessage: string): Observable<any> {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<[Blog[], User]>(url, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          tap({
            next: ([blogs, user]) => {
              (this.blogs.set(blogs), console.log(user));
            },
          }),
        )
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new Error(errMessage, error));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error(errMessage);
    });
  }

  private fetchBlogDetail(blogId: number, url: string, errMessage: string): Observable<any> {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<[Blog, Comment[]]>(`${this.apiUrl}api/blog/${blogId}`, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          tap({
            next: ([blog, comments]) => {
              this.blogDetail.set({ ...blog, comments: comments });
              // console.log(this.blogDetail());
            },
          }),
        )
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new Error(errMessage, error));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error(errMessage);
    });
  }

  private fetchBlogVoteDetail(url: string, errMessage: string): Observable<any> {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<[BlogVoteDetail, Comment[]]>(url, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          tap({
            next: ([blogVoteDetail, comments]) => {
              this.blogVoteDetail.set({ ...blogVoteDetail, comments: comments });
              // console.log(this.blogVoteDetail());
            },
          }),
        )
        .pipe(
          catchError((error) => {
            return throwError(() => new Error(errMessage, error));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error(errMessage);
    });
  }

  private fetchCategories(url: string, errMessage: string) {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<{ categories: Category[] }>(`${this.apiUrl}api/categories/`, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          map(({ categories }) => {
            this.categories.set(categories);
          }),
        )
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new Error(errMessage, error));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error('error fetching authors');
    });
  }

  loadBlogs() {
    return this.fetchBlogs(`${this.apiUrl}api/blogs/`, 'Error loading blogs');
  }

  loadBlogDetail(blogId: number) {
    return this.fetchBlogDetail(
      blogId,
      `${this.apiUrl}api/blog/${blogId}/`,
      'Error loading blog detail',
    );
  }

  loadCategories() {
    return this.fetchCategories(`${this.apiUrl}api/categories/`, 'Error loading categories');
  }

  loadBlogVoteDetail(blogId: number) {
    return this.fetchBlogVoteDetail(
      `${this.apiUrl}api/blog/${blogId}/vote/`,
      'Error loading BlogVoteDetail',
    );
  }

  postNewBlog(newBlog: NewBlogModel) {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .post<Blog>(`${this.apiUrl}api/blogs/`, newBlog, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          tap({
            next: (blog) => {
              this.blogs.update((blogs) => [...blogs, blog]);
            },
          }),
        )
        .pipe(
          catchError((err) => {
            return throwError(() => new Error('Error posting new blog', err));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error('error posting new blog');
    });
  }
}
