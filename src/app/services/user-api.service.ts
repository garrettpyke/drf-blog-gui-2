import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private httpClient = inject(HttpClient);
  private user = signal<User | undefined>(undefined);
  private users = signal<User[]>([]);
  private apiUrl = environment.apiUrl;

  currentUser = this.user.asReadonly();
  loadedUsers = this.users.asReadonly();

  constructor() {
    // todo: See [this link](https://medium.com/bb-tutorials-and-thoughts/retaining-state-of-the-angular-app-when-page-refresh-with-ngrx-6c486d3012a9)
    //* ...for ideas on how to persist state across page refreshes
    const savedUser = localStorage.getItem('blog_user');
    if (savedUser) {
      this.user.set(JSON.parse(savedUser));
    }
  }

  buildHttpHeaders(token: string, params?: string | string[]): HttpHeaders {
    return new HttpHeaders({
      Authorization: `token ${token}`,
    });
  }

  private verifyToken(): string {
    const { token } = this.user()!;
    if (token) {
      return token;
    }
    return '';
    // const httpResponse = new HttpResponse({
    //   body: 'Invalid token',
    //   status: HttpStatusCode.Unauthorized,
    // });
  }

  signIn(userId: string, password: string) {
    return this.httpClient
      .post<{ user: User }>(`${this.apiUrl}api/sign-in/`, {
        email: userId,
        password: password,
      })
      .pipe(
        tap({
          next: ({ user }) => {
            // console.log(user);
            this.user.set(user);
            localStorage.setItem('blog_user', JSON.stringify(user)); //* see above
          },
        }),
      )
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Sign-on error!', error));
        }),
      );
  }

  signout() {
    const token = this.verifyToken();
    if (token) {
      return this.httpClient
        .delete<HttpResponse<any>>(`${this.apiUrl}api/sign-out/`, {
          headers: this.buildHttpHeaders(token),
        })
        .pipe(
          map((response) => {
            // console.log(response); // null
            console.log('BlogApiService: Clearing user data after logout.');
            this.user.set(undefined);
            localStorage.removeItem('blog_user');
            return response;
          }),
        )
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new Error('Error during logout.'));
          }),
        );
    }
    return new Observable((observer) => {
      observer.error('error fetching authors');
    });
  }

  fetchUsers() {
    const token = this.verifyToken();
    if (token) {
      return (
        this.httpClient
          // correct data typing here is important
          .get<{ users: User[] }>(`${this.apiUrl}api/users/`, {
            headers: this.buildHttpHeaders(token),
          })
          .pipe(
            tap({
              next: ({ users }) => {
                this.users.set(users);
              },
            }),
          )
          .pipe(
            catchError((error) => {
              console.log(error);
              return throwError(() => new Error(`Error fetching authors: ${error.message}`));
            }),
          )
      );
    }
    return new Observable((observer) => {
      observer.error('error fetching authors');
    });
  }
}
