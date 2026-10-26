export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginField = keyof LoginCredentials;
