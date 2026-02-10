import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';
import { type Blog } from '../models/blog.model';
import { type Category } from '../models/category.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' })
export class BlogApiService {
  private httpClient = inject(HttpClient);
  private userApiService = inject(UserApiService);
  private user = signal<User>(this.userApiService.currentUser()!);
  private blogs = signal<Blog[]>([]);
  private categories = signal<Category[]>([]);
  private destroyRef = inject(DestroyRef);
  private apiUrl = environment.apiUrl;

  loadedBlogs = this.blogs.asReadonly();
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
        console.log(this.loadedCategories());
      },
    });
    this.destroyRef.onDestroy(() => categorySubscription.unsubscribe());

    const authorSubscription = this.userApiService.fetchUsers().subscribe({
      error: (error: Error) => {
        console.error('Error loading authors:', error);
      },
      complete: () => {
        console.log('Author loading completed');
        console.log(this.loadedAuthors());
      },
    });
    this.destroyRef.onDestroy(() => authorSubscription.unsubscribe());

    const apiUrl = environment.apiUrl;
    console.log(apiUrl);
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
    // console.log

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
            return throwError(() => new Error(error.message));
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
        .get<{ categories: Category[] }>('http://localhost:8000/api/categories/', {
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
            return throwError(() => new Error(`Error fetching categories: ${error.message}`));
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

  loadCategories() {
    return this.fetchCategories(`${this.apiUrl}api/categories/`, 'Error loading categories');
  }
}
