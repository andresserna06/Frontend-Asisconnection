// Published addresses confirmed by the team, by normalized project name.
// They win over the backend directory and work even when it is unavailable.
export const PUBLISHED_PROJECT_URLS: Record<string, string> = {
  suma21: 'https://suma21-frontend.onrender.com',
  aulaup: 'https://aulaup-bxss.onrender.com/',
  sagaup: 'https://saga-up-frontend.onrender.com/login',
};

export type EcosystemLink = {
  id: string;
  projectName: string;
  url: string;
  description: string;
};
