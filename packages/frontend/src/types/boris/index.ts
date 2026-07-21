export interface GithubIssue {
  id: string;
  url: string;
  html_url: string;
  body: string;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  pull_request?: unknown;
}

export type IGetGithubIssuesResult = GithubIssue[];

export type StatBackend = {
  users: {
    total: number;
    alive: number;
  };
  nodes: {
    images: number;
    audios: number;
    videos: number;
    texts: number;
    total: number;
    by_month: number[];
  };
  comments: {
    total: number;
    by_month: number[];
  };
  files: {
    count: number;
    size: number;
  };
};

export interface BorisUsageStats {
  issues: GithubIssue[];
  backend: StatBackend;
}
export type IBorisState = Readonly<{
  stats: BorisUsageStats;
}>;
