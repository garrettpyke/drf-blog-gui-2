/*
    LOVE = 2
    LIKE = 1
    NO_VOTE = 0
    DOWN_VOTE = -1
    VOTE_TYPE_CHOICES = {
        LOVE: "Love",
        LIKE: "Like",
        NO_VOTE: "",
        DOWN_VOTE: "Down"
  */
export interface VoteMap {
  love: number;
  like: number;
  meh: number;
  downVote: number;
}
