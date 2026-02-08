import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';
import { type Blog } from '../models/blog.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' }) // todo: limit to BlogApiService & Login?
export class BlogApiService {
  private httpClient = inject(HttpClient);
  private userApiService = inject(UserApiService);
  private user = signal<User>(this.userApiService.currentUser()!);
  private blogs = signal<Blog[]>([]);

  loadedBlogs = this.blogs.asReadonly();

  private verifyToken(): string {
    const { token } = this.user()!;
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
}
