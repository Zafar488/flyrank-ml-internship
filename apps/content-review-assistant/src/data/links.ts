// ─── External Links ───

export const RESEARCH_URL = 'https://zafar488.github.io/flyrank-ml-internship/';
export const GITHUB_URL = 'https://github.com/Zafar488/flyrank-ml-internship';
export const CONTACT_EMAIL = 'mailto:zafarullah1385@gmail.com';

// Configurable via environment variable
export const PORTFOLIO_URL =
  import.meta.env.VITE_PORTFOLIO_URL || '#portfolio';

export function isResearchPaperAvailable(): boolean {
  return import.meta.env.VITE_RESEARCH_PAPER_AVAILABLE !== 'false';
}
