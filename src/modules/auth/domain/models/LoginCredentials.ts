export type LoginCredentials = {
  email: string;
  password: string;
  // Express acceptance of personal data processing (Ley 1581 de 2012, Ley 1098 de 2006).
  acceptConsent: boolean;
};

export type LoginField = keyof LoginCredentials;
