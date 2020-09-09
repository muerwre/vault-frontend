export const sortCreatedAtAsc = (a, b) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

export const sortCreatedAtDesc = (a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
