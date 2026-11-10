import { ForumScreen } from '@/modules/forum';
import { NotificationsPanel } from '@/modules/notifications';

export default function ForumRoute() {
  return <ForumScreen aside={<NotificationsPanel />} />;
}
