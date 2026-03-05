import { Component, OnInit, DestroyRef, input, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
type MatCardAppearance = 'outlined' | 'raised' | 'filled';

// import { UpdateBlog } from '../update-blog/update-blog';
import { Comment } from '../../comments/comment/comment';
import { type BlogVoteDetail } from '../../models/blog-vote-detail.model';
import { type Category } from '../../models/category.model';
import { type User } from '../../models/user.model';
import { type Vote } from '../../models/vote.model';
import { type VoteMap } from '../../models/vote-map.model';
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
  blogVoteDetail = signal<BlogVoteDetail | undefined>(undefined);
  comments = computed(() => this.blogVoteDetail()?.comments ?? []);
  votes = computed<Vote[] | []>(() => this.blogVoteDetail()?.votes ?? []);
  categories = signal<Category[]>(this.blogApiService.loadedCategories());
  users = computed<User[]>(() => this.blogApiService.loadedAuthors());
  user = computed<User>(() => this.blogApiService.user()!);
  updateBlog = false;
  blogAppearance: MatCardAppearance = 'raised';
  voteMap = { love: false, like: false, meh: false, downVote: false };
  private router = inject(Router);
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    const subscription = this.blogApiService.loadBlogVoteDetail(this.blogId()).subscribe({
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        console.log(this.blogApiService.loadedBlogVoteDetail());
        this.blogVoteDetail.set(this.blogApiService.loadedBlogVoteDetail());
        console.log('BlogVote detail loaded');
        this.setVoteMap();
        console.log(this.voteMap);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  get title(): string {
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

  setVoteMap(): void {
    this.votes().forEach((vote) => {
      switch (vote.vote_type) {
        case 2:
          this.voteMap.love = true;
          break;
        case 1:
          this.voteMap.like = true;
          break;
        case 0:
          this.voteMap.meh = true;
          break;
        case -1:
          this.voteMap.downVote = true;
          break;
      }
    });
    // todo: Consider using a VoteMap array: voteMap[vote_type] could be easier to work with
  }

  onClickDeleteBlog(): void {
    console.log('Delete Blog clicked');

    const subscription = this.blogApiService.deleteBlog(this.blogId()).subscribe({
      error: (err: Error) => {
        console.log('Error deleting blog');
        console.log(err);
      },
      complete: () => {
        console.log(`Blog with ID ${this.blogId()} deleted successfully.`);
        // this.router.navigate(['../']);
        this.router.navigate(['//blog-app/blogs']);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onClickUpdateBlog() {
    console.log('Update Blog clicked');
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
