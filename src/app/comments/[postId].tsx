import { useLocalSearchParams } from 'expo-router';

import { CommentsScreen } from '@/modules/comments';

export default function CommentsRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  return <CommentsScreen postId={postId} />;
}
