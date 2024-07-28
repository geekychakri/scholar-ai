export type PaperType = {
  paperId: string;
  title: string;
  abstract: string;
  year: number;
  isOpenAccess: boolean;
  openAccessPdf: {
    url: string;
    status: string;
  } | null;
  tldr: {
    model: string;
    text: string;
  };
  citationCount: number;
  isBookmarked: boolean;
  authors: {
    authorId: string;
    name: string;
  }[];
};

export type BookmarksType = {
  paperId: string;
  title: string;
  abstract: string;
  year: number;
  openAccessPdf: {
    url: string;
    status: string;
  } | null;
  tldr: {
    model: string;
    text: string;
  };
  citationCount: number;
  isBookmarked: boolean;
  authors: {
    authorId: string;
    name: string;
  }[];
  user_id: string;
  id: string;
  created_at: string;
};
