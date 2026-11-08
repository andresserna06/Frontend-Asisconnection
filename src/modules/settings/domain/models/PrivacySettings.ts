export type PrivacySettings = {
  showEmail: boolean;
  showBirthDate: boolean;
  showCity: boolean;
  requireFollowApproval: boolean;
};

// Per Ley 1581 de 2012, personal fields are off (private) by default.
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showEmail: false,
  showBirthDate: false,
  showCity: false,
  requireFollowApproval: false,
};
