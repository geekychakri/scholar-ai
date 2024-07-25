import { useRouter } from "next/router";

import { columns } from "@/components/DataTable/Columns";

import DataTable from "@/components/DataTable";

import { Button } from "@/components/ui/button";

import { usePapers } from "@/hooks/usePapers";

import { PaperType } from "@/types";

function PaperList({ user }: { user: any }) {
  const router = useRouter();
  const { q } = router.query;

  const { papers, error, isLoading, isValidating, size, setSize } =
    usePapers(user);

  const isLoadingMore =
    isValidating ||
    (size > 0 && papers && typeof papers[size - 1] === "undefined");

  const csvData = papers?.map(
    ({
      paperId,
      citationCount,
      tldr,
      authors,
      isBookmarked,
      ...keepAttrs
    }: PaperType) => {
      return { ...keepAttrs, openAccessPdf: keepAttrs.openAccessPdf?.url };
    }
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={papers}
        isLoading={isLoading}
        csvData={csvData}
        user={user}
      />
      {!error && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSize((size) => size + 1)}
        >
          {isLoadingMore && q ? (
            <span className="flex items-center gap-2">
              <span>Loading</span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <circle cx="4" cy="12" r="3" fill="currentColor">
                    <animate
                      id="svgSpinners3DotsScale0"
                      attributeName="r"
                      begin="0;svgSpinners3DotsScale1.end-0.25s"
                      dur="0.75s"
                      values="3;.2;3"
                    />
                  </circle>
                  <circle cx="12" cy="12" r="3" fill="currentColor">
                    <animate
                      attributeName="r"
                      begin="svgSpinners3DotsScale0.end-0.6s"
                      dur="0.75s"
                      values="3;.2;3"
                    />
                  </circle>
                  <circle cx="20" cy="12" r="3" fill="currentColor">
                    <animate
                      id="svgSpinners3DotsScale1"
                      attributeName="r"
                      begin="svgSpinners3DotsScale0.end-0.45s"
                      dur="0.75s"
                      values="3;.2;3"
                    />
                  </circle>
                </svg>
              </span>
            </span>
          ) : (
            "Show more"
          )}
        </Button>
      )}
    </div>
  );
}

export default PaperList;
