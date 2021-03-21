export interface IGithubIssue {
  id: string;
  url: string;
  html_url: string;
  body: string;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  pull_request?: unknown;
}

export type IGetGithubIssuesResult = IGithubIssue[];
