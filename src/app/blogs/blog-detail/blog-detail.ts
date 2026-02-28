import {
  Component,
  OnInit,
  DestroyRef,
  input,
  output,
  signal,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
type MatCardAppearance = 'outlined' | 'raised' | 'filled';

// import { UpdateBlog } from '../update-blog/update-blog';
import { Comment } from '../../comments/comment/comment';
// import { type BlogDetail as BlogDetailModel } from '../../models/blog-detail.model';
import { type Category } from '../../models/category.model';
import { type User } from '../../models/user.model';
import { BlogApiService } from '../../services/blog-api.service';

@Component({
  selector: 'app-blog-detail',
  imports: [MatCardModule, MatChipsModule, MatIconModule, DatePipe, Comment],
  // imports: [MatCardModule, MatChipsModule, MatIconModule, DatePipe, Comment, UpdateBlog],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit {
  private blogApiService = inject(BlogApiService);
  blogId = input.required<number>();
  commentsOrder = signal<'asc' | 'desc'>('desc'); // todo: route query param
  blogDetail = computed(() => this.blogApiService.loadedBlogDetail());
  comments = computed(() => this.blogDetail()?.comments ?? []);
  categories = signal<Category[]>(this.blogApiService.loadedCategories());
  users = computed<User[]>(() => this.blogApiService.loadedAuthors());
  user = computed<User>(() => this.blogApiService.user()!);
  deleteBlog = output<boolean>();
  updateBlog = false;
  blogAppearance: MatCardAppearance = 'raised';
  destroyRef = inject(DestroyRef);

  constructor() {
    console.log(this.categories());
  }

  ngOnInit() {
    const subscription = this.blogApiService.loadBlogDetail(this.blogId()).subscribe({
      error: (error: Error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Blog detail loaded!');
        // console.log('comments: ' + this.comments().length);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  get title(): string {
    return this.blogDetail()?.title || 'undefined title';
  }

  content = computed<string>(() => this.blogDetail()?.content || 'undefined content');

  categorySubject = computed<string>(() => {
    const cat = this.blogApiService
      .loadedCategories()
      .find((cat) => cat.id === this.blogDetail()?.category);
    if (cat) {
      return cat.genre ? cat.subject + ' (' + cat.genre + ')' : cat.subject;
    }
    return 'undefined category';
  });

  get author(): User {
    const author = this.users()?.find((user) => user.id === this.blogDetail()?.author);
    if (author) {
      return author;
    }
    return { id: -1, email: 'unknown author' };
  }

  authorInfo(authorId: number): string {
    const user = this.users()?.find((user) => user.id === authorId);
    return user ? user.email : 'unknown author';
  }

  onClickDeleteBlog() {
    console.log('Delete Blog clicked');
    this.deleteBlog.emit(true);
  }

  onClickUpdateBlog() {
    // console.log('Update Blog clicked');
    // if (!this.blogApiService.currentUser()) {
    //   console.log('Ya gotta be logged in to update a blog!');
    //   return;
    // }
    // this.updateBlog = true;
  }

  // onCancelUpdate() {
  //   console.log('Update Blog cancelled');
  //   this.blogDetail.set(this.blogApiService.loadedBlogDetail());
  //   this.updateBlog = false;
  // }
}
