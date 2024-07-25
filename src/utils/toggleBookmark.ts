import { PaperType } from "@/types";
import { Row } from "@tanstack/react-table";

export function toggleBookmark<TData>(papers: PaperType[], row: Row<TData>) {
  const prevPapers = [...papers];
  const filteredPapers = prevPapers.map((paper) => {
    return paper.paperId === (row.original as PaperType)?.paperId
      ? { ...paper, isBookmarked: !paper.isBookmarked }
      : paper;
  });
  return [...filteredPapers];
}
