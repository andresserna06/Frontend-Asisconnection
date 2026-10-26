import { getPrimaryRole, ROLE_LABELS, type Role } from '@/modules/auth/domain/roles';
import { Badge, type BadgeSize, type BadgeTone } from '@/shared/ui/atoms/Badge';

// Mockup styles: "Familia" -> neutral, "Profesional" -> accent, foundation -> primary.
const ROLE_TONES: Record<Role, BadgeTone> = {
  ADMIN: 'primary',
  TALLERISTA: 'accent',
  ESTUDIANTE: 'accent',
  ACUDIENTE: 'neutral',
  DONANTE: 'neutral',
};

type RoleBadgeProps = {
  roles: readonly Role[];
  size?: BadgeSize;
};

export function RoleBadge({ roles, size }: RoleBadgeProps) {
  const role = getPrimaryRole(roles);
  if (role === null) {
    return null;
  }
  return <Badge label={ROLE_LABELS[role]} tone={ROLE_TONES[role]} size={size} />;
}
