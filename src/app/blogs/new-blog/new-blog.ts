import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // todo: look into validators & formbuilder usage
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
// import { MatFormField, MatLabel } from '@angular/material/form-field';
// import { MatSelect } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';

import { type Category } from '../../models/category.model';
import { type NewBlogModel } from '../../models/new-blog.model';
import { BlogApiService } from '../../services/blog-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-blog',
  imports: [FormsModule, MatButtonModule, MatDividerModule],
  templateUrl: './new-blog.html',
  styleUrl: './new-blog.css',
})
export class NewBlog {
  close = output<void>();
  blogValid = false;
  title = '';
  content = '';
  category!: number;
  newBlog!: NewBlogModel;
  categories = input<Category[]>();
  blogApiService = inject(BlogApiService);
  destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private validateBlog(): boolean {
    const { id, email, token } = this.blogApiService.user()!;
    console.log(`validateBlog().token: ${token}`);
    console.log(`validateBlog().id: ${id}`);
    console.log(`validateBlog().email: ${email}`);

    if (id && this.title && this.content) {
      this.newBlog = {
        title: this.title,
        content: this.content,
        category: this.category,
        author: id,
      };

      this.blogValid = true;
      console.log('New Blog is valid!');
      return true;
    }
    console.log('New Blog invalid.');
    return false;
  }

  onSubmit() {
    if (this.validateBlog()) {
      console.log('new blog valid!');

      const subscription = this.blogApiService.postNewBlog(this.newBlog).subscribe({
        error: (error: Error) => {
          console.error('Error posting new blog:', error);
        },
        complete: () => {
          console.log('Blog post completed');
          this.router.navigate(['blog-app/blogs']);
        },
      });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    } else {
      console.log('Could not validate new blog.');
    }
  }

  onCancel() {
    // this.close.emit();
    this.router.navigate(['blog-app/blogs']);
  }

  onFieldChange(field: any) {
    if (this.blogApiService.user()?.id && this.title && this.content) {
      this.blogValid = true;
    }
  }
}
