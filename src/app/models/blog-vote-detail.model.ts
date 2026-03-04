import { type Comment } from '../models/comment.model';
import { type Vote } from '../models/vote.model';

export interface BlogVoteDetail {
  id: number;
  title: string;
  content: string;
  category: number;
  author: number;
  updated_at: string;
  votes: Vote[];
  comments?: Comment[];
}
