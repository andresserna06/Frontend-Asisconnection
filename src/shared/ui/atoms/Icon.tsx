import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Feather>['name'];

type IconProps = {
  name: IconName;
  size: number;
  color: string;
};

// Decorative icon (Feather, stroke style like the mockups). Hidden from screen readers:
// the surrounding control carries the label.
export function Icon({ name, size, color }: IconProps) {
  return (
    <Feather
      name={name}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
