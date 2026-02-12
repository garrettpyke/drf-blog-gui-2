import { Component, DestroyRef, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { type User } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  enteredUserId = '';
  password = '';
  private userApiService = inject(UserApiService);
  private destroyRef = inject(DestroyRef);
  signIn = output<User>({});

  onSubmit() {
    const subscription = this.userApiService.signIn(this.enteredUserId, this.password).subscribe({
      error: (err: Error) => {
        console.log('sign-on error', err);
      },
      complete: () => {
        this.signIn.emit(this.userApiService.currentUser()!);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
