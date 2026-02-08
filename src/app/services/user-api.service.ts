import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';

@Injectable({ providedIn: 'root' }) // todo: limit to BlogApiService & Login?
export class UserApiService {
  private httpClient = inject(HttpClient);
  private user = signal<User | undefined>(undefined);
  private users = signal<User[]>([]);

  currentUser = this.user.asReadonly();
  loadedUsers = this.users.asReadonly();

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
    // return new Observable((observer) => {
    //   observer.error(httpResponse.body);
    // });
  }

  signIn(userId: string, password: string) {
    return this.httpClient
      .post<{ user: User }>('http://localhost:8000/api/sign-in/', {
        email: userId,
        password: password,
      })
      .pipe(
        tap({
          next: (respData) => {
            console.log(respData);
            console.log(respData.user);
            this.user.set(respData.user);
            localStorage.setItem('blog_user', JSON.stringify(respData.user));
          },
        }),
      )
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Sign-on error!'));
        }),
      );
  }

  fetchAuthors() {
    const token = this.verifyToken();
    if (token) {
      return (
        this.httpClient
          //* Correct data typing here is important
          .get<{ users: User[] }>(`http://localhost:8000/api/users/`, {
            headers: this.buildHttpHeaders(token),
          })
          .pipe(
            map((respData) => {
              this.users.set(respData.users);
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
