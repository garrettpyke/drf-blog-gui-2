import { Routes } from '@angular/router';
import { NavMain } from './nav-main/nav-main';

/*
     <my-domain> => login (if not logged in, else blogs/all)
     <my-domain>/blogs/all => all blogs
        <my-domain>/blogs/all/category/:categoryId => all blogs in category chosen
        <my-domain>/blogs/all/author/:authorId => all blogs
        <my-domain>/blogs/all/search/:params => all blogs
     <my-domain>/blogs/:id => blog detail
*/

export const routes: Routes = [
  {
    path: 'main',
    component: NavMain,
  },
];
