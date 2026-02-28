import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-nav-main',
  imports: [RouterOutlet],
  templateUrl: './nav-main.html',
  styleUrl: './nav-main.css',
})
export class NavMain {
  // private userApiService = inject(UserApiService);
  // user = computed(() => this.userApiService.currentUser());
}
