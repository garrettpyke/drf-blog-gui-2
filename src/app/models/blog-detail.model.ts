import { type Comment } from '../models/comment.model';

export interface BlogDetail {
  id: number;
  title: string;
  content: string;
  category: number;
  author: number;
  updated_at: string;
  comments: Comment[];
  // uri: string;
  // votes: number;
}
