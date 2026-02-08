import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap, map, throwError } from 'rxjs';

import { type User } from '../models/user.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' }) // todo: limit to BlogApiService & Login?
export class BlogApiService {
  private httpClient = inject(HttpClient);
  private userApiService = inject(UserApiService);
  private user = signal<User>(this.userApiService.currentUser()!);

  private buildHttpHeaders(params?: string | string[]) {
    const { token } = this.user()!;
    if (token) {
      return this.userApiService.buildHttpHeaders(token, params);
    }
    return 'error building headers';
  }
}
