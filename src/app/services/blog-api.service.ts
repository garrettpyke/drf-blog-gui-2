import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';
import { type Blog } from '../models/blog.model';
import { type Category } from '../models/category.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' }) // todo: limit to BlogApiService & Login?
export class BlogApiService {
  private httpClient = inject(HttpClient);
  private userApiService = inject(UserApiService);
  private user = signal<User>(this.userApiService.currentUser()!);
  private blogs = signal<Blog[]>([]);
  private categories = signal<Category[]>([]);
  private destroyRef = inject(DestroyRef);

  loadedBlogs = this.blogs.asReadonly();
  loadedCategories = this.categories.asReadonly();
  loadedAuthors = computed(
    () => this.userApiService.loadedUsers(),
    // this.userApiService.loadedUsers().map((author) => [author.id, author.email]), //* typescript tuple
  );

  // todo: test category loading in constructor
  constructor() {
    const categorySubscription = this.fetchCategories().subscribe({
      error: (error: Error) => {
        console.error('Error loading categories', error);
      },
      complete: () => {
        console.log('Category loading completed');
        console.log(this.loadedCategories());
      },
    });
    this.destroyRef.onDestroy(() => categorySubscription.unsubscribe());

    const authorSubscription = this.userApiService.fetchAuthors().subscribe({
      error: (error: Error) => {
        console.error('Error loading authors:', error);
      },
      complete: () => {
        console.log('Author loading completed');
        // console.log(this.userApiService.loadedUsers());
        console.log(this.loadedAuthors());
      },
    });
    this.destroyRef.onDestroy(() => authorSubscription.unsubscribe());
  }

  private verifyToken(): string {
    const { token } = this.user()!;
    if (token) {
      return token;
    }
    return '';
  }

  fetchBlogs(url: string, errMessage: string): Observable<any> {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<[Blog[], User]>(url, {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          tap({
            next: (respData) => {
              this.blogs.set(respData[0]);
              console.log(this.blogs());
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
      observer.error('error fetching authors');
    });
  }

  fetchCategories() {
    const token = this.verifyToken();

    if (token) {
      return this.httpClient
        .get<{ categories: Category[] }>('http://localhost:8000/api/categories/', {
          headers: this.userApiService.buildHttpHeaders(token),
        })
        .pipe(
          map((respData) => {
            this.categories.set(respData.categories);
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
}
