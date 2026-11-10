import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useContentRemoval } from '@/modules/removal/application/useContentRemoval';
import type { RemovalTarget } from '@/modules/removal/domain/models/RemovalTarget';
import { RemovalError } from '@/modules/removal/domain/RemovalService';
import { COLORS, OPACITY, SIZE } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';

import { REMOVAL_STRINGS } from './strings';

type RemoveContentButtonProps = {
  target: RemovalTarget;
  onRemoved?: () => void;
};

// Renders nothing for people who are not allowed to remove this content.
export function RemoveContentButton({ target, onRemoved }: RemoveContentButtonProps) {
  const { canRemove, remove, removesForEveryone } = useContentRemoval();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canRemove(target)) {
    return null;
  }

  const label = target.kind === 'post' ? REMOVAL_STRINGS.removePost : REMOVAL_STRINGS.removeComment;

  async function handleConfirm() {
    setError(null);
    setIsRemoving(true);
    try {
      await remove(target);
      setIsConfirming(false);
      onRemoved?.();
    } catch (caught) {
      setError(
        REMOVAL_STRINGS.errors[caught instanceof RemovalError ? caught.kind : 'unavailable'],
      );
    } finally {
      setIsRemoving(false);
    }
  }

  function handleCancel() {
    setError(null);
    setIsConfirming(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setIsConfirming(true)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name="trash-2" size={SIZE.iconSmall} color={COLORS.danger} />
      </Pressable>
      <ConfirmDialog
        visible={isConfirming}
        title={label}
        message={
          removesForEveryone ? REMOVAL_STRINGS.everyoneMessage : REMOVAL_STRINGS.requestMessage
        }
        confirmLabel={REMOVAL_STRINGS.confirm}
        cancelLabel={REMOVAL_STRINGS.cancel}
        isBusy={isRemoving}
        error={error}
        onConfirm={() => void handleConfirm()}
        onCancel={handleCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
});
