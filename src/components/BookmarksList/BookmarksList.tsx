import Head from "next/head";

import { createClient } from "@/utils/supabase/component";
import { Bookmark } from "lucide-react";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import DataTable from "@/components/DataTable";
import { columns } from "@/components/DataTable/Columns";

import { Spinner } from "@/SVG/Spinner";

import { BookmarksType } from "@/types";

const metaData = (
  <Head>
    <title>Bookmarks</title>
    <meta name="description" content="Bookmarks" />
  </Head>
);

export default function Bookmarks() {
  const supabase = createClient();

  const {
    data = [],
    error,
    count,
    isLoading,
  } = useQuery(
    supabase
      .from("starred")
      .select(
        "id, user_id, created_at, title, abstract, year, openAccessPdf, tldr, citationCount, authors, paperId,isBookmarked"
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  console.log(data);

  const csvData = data?.map(
    ({
      paperId,
      citationCount,
      tldr,
      authors,
      id,
      created_at,
      user_id,
      isBookmarked,
      ...keepAttrs
    }: BookmarksType) => {
      return { ...keepAttrs, openAccessPdf: keepAttrs.openAccessPdf?.url };
    }
  );

  console.log({ csvData });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-6">Something went wrong!</div>;
  }

  if (!data?.length) {
    return (
      <>
        {metaData}
        <div className="flex-1 flex flex-col gap-5 items-center justify-center text-center text-xl">
          <Bookmark size={120} />
          <p>No bookmarks yet!</p>
          <p>This is where you will see your bookmarks.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {metaData}
      <div className="flex flex-col gap-3 p-4">
        <h1 className="font-medium">Bookmarks</h1>
        <DataTable
          columns={columns}
          data={data as []}
          isLoading={isLoading}
          csvData={csvData}
        />
      </div>
    </>
  );
}
