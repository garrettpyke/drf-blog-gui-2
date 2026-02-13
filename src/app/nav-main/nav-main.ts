import { Component, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-nav-main',
  imports: [RouterOutlet],
  templateUrl: './nav-main.html',
  styleUrl: './nav-main.css',
})
export class NavMain {}
