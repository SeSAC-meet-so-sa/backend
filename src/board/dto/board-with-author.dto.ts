export interface BoardWithAuthorDto {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  visibility: string;
  likes: string[];
  bookmarks: string[];
  viewCount: number;
  author: {
    id: string;
    username: string;
    profileImage: string;
    mood: string;
  };
  likesCount: number;
}
