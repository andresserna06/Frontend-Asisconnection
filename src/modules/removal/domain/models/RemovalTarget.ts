export type RemovalTarget =
  | {
      kind: 'post';
      id: string;
      authorName: string;
      authorProfileId: string | null;
      authorUsername?: string | null;
    }
  | {
      kind: 'comment';
      id: string;
      postId: string;
      authorName: string;
      authorProfileId: string | null;
      authorUsername?: string | null;
    };

export type RemovalRequest = { kind: 'post' } | { kind: 'comment'; commentId: string };
