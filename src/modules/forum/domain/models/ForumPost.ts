import type { ForumCategory } from './ForumCategory';

export type ForumPostMedia =
  | { kind: 'image'; uri: string; accessibilityLabel: string }
  | { kind: 'video'; thumbnailUri: string; accessibilityLabel: string; durationLabel: string };

export type ForumPost = {
  id: string;
  category: ForumCategory;
  author: {
    id: string;
    name: string;
    initials: string;
    roleLabel: string;
    avatarUri: string | null;
  };
  publishedAtLabel: string;
  content: string;
  media: ForumPostMedia | null;
  likeCount: number;
  commentCount: number;
};
