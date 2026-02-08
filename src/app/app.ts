import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { type User } from './models/user.model';
import { Header } from './header/header';
import { Login } from './login/login';
import { UserApiService } from './services/user-api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Login],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('blog-gui');
  private userApiService = inject(UserApiService);
  user = signal<User | undefined>(undefined);

  onSignIn(user: User) {
    console.log(`onSignIn: ${user.id}`);
    this.user.set(this.userApiService.currentUser());
  }
}
