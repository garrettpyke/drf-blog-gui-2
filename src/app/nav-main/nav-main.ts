import { Component, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BlogDetail } from '../blogs/blog-detail/blog-detail';
@Component({
  selector: 'app-nav-main',
  imports: [RouterOutlet, BlogDetail],
  templateUrl: './nav-main.html',
  styleUrl: './nav-main.css',
})
export class NavMain {}
