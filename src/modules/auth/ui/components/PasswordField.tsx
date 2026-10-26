import { useState } from 'react';

import { LOGIN_STRINGS } from '@/modules/auth/ui/strings';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { TextField, type TextFieldProps } from '@/shared/ui/molecules/TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'rightAccessory'>;

// Password input with a show/hide toggle.
export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      rightAccessory={
        <IconButton
          icon={isVisible ? 'eye-off' : 'eye'}
          accessibilityLabel={isVisible ? LOGIN_STRINGS.hidePassword : LOGIN_STRINGS.showPassword}
          onPress={() => setIsVisible((current) => !current)}
        />
      }
    />
  );
}
