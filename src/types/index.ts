export type PaperType = {
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
};
