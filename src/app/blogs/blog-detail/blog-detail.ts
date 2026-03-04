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
import { type Vote } from '../../models/vote.model';
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
  // blogDetail = computed(() => this.blogApiService.loadedBlogDetail());
  blogVoteDetail = computed(() => this.blogApiService.loadedBlogVoteDetail());
  comments = computed(() => this.blogVoteDetail()?.comments ?? []);
  votes = computed<Vote[] | []>(() => this.blogVoteDetail()?.votes ?? []);
  categories = signal<Category[]>(this.blogApiService.loadedCategories());
  users = computed<User[]>(() => this.blogApiService.loadedAuthors());
  user = computed<User>(() => this.blogApiService.user()!);
  deleteBlog = output<boolean>();
  updateBlog = false;
  blogAppearance: MatCardAppearance = 'raised';
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    const subscription = this.blogApiService.loadBlogDetail(this.blogId()).subscribe({
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        // console.log('Blog detail loaded!');
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    const blogVoteDetailSubscription = this.blogApiService
      .loadBlogVoteDetail(this.blogId())
      .subscribe({
        error: (err: Error) => {
          console.log(err);
        },
        complete: () => {
          console.log('BlogVote detail loaded');
          console.log(this.blogApiService.loadedBlogVoteDetail());
        },
      });

    this.destroyRef.onDestroy(() => {
      blogVoteDetailSubscription.unsubscribe();
    });
  }

  get title(): string {
    // return this.blogDetail()?.title || 'undefined title';
    return this.blogVoteDetail()?.title || 'undefined title';
  }

  content = computed<string>(() => this.blogVoteDetail()?.content || 'undefined content');

  categorySubject = computed<string>(() => {
    const cat = this.blogApiService
      .loadedCategories()
      .find((cat) => cat.id === this.blogVoteDetail()?.category);
    if (cat) {
      return cat.genre ? cat.subject + ' (' + cat.genre + ')' : cat.subject;
    }
    return 'undefined category';
  });

  get author(): User {
    const author = this.users()?.find((user) => user.id === this.blogVoteDetail()?.author);
    if (author) {
      return author;
    }
    return { id: -1, email: 'unknown author' };
  }

  authorInfo(authorId: number): string {
    const user = this.users()?.find((user) => user.id === authorId);
    return user ? user.email : 'unknown author';
  }

  get totalVotes(): number {
    let total = 0;
    this.votes().forEach((vote) => (total += vote.vote_type));
    return total;
  }

  voteMap(): number[] {
    let voteMap = [0, 0, 0, 0]; // todo: make object instead

    this.votes().forEach((vote) => (voteMap[vote.vote_type] = 1));
    return voteMap;
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
