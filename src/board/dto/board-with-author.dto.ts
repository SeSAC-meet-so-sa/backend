export class BoardWithAuthorDto {
  title: string;
  content: string;
  images: string[];
  visibility: string;
  likes: string[];
  bookmarks: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    profileImage: string;
    description: string;
  };
}
