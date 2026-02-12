import { Component, signal, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';

import { type User } from './models/user.model';
import { Header } from './header/header';
import { Login } from './login/login';
import { UserApiService } from './services/user-api.service';
import { NavMain } from './nav-main/nav-main';

@Component({
  selector: 'app-root',
  imports: [Header, Login, NavMain],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('blog-gui');
  private userApiService = inject(UserApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  user = signal<User | undefined>(undefined);

  onSignIn(user: User) {
    this.user.set(this.userApiService.currentUser());

    this.router.navigate(['/main']);
  }

  onSignOut() {
    const subscription = this.userApiService.signout().subscribe({
      next: (response: any) => {
        console.log('logging out');
      },
      complete: () => {
        this.user.set(undefined);
      },
      error: (err: Error) => {
        console.error('Error during logout: ', err);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    this.router.navigate(['']);
  }
}
