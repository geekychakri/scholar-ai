import Head from "next/head";

import type { GetServerSidePropsContext } from "next";

import Link from "next/link";

import { createClient } from "@/utils/supabase/component";
import { createClient as createClientServer } from "@/utils/supabase/server-props";
import { Bookmark } from "lucide-react";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { Spinner } from "@/SVG/Spinner";

import { dateConverter } from "@/utils/dateConverter";

const metaData = (
  <Head>
    <title>Notes</title>
    <meta name="description" content="Notes" />
  </Head>
);

export default function Notes() {
  const supabase = createClient();

  const { data, error, count, isLoading } = useQuery(
    supabase.from("notes").select("paper_title, paper_id, created_at, note"),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  console.log(data);

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
          <p>No notes yet!</p>
          <p>This is where you will see your notes.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {metaData}
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-xl font-medium">Notes</h1>
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start border border-gray-300 p-6 mb-8 rounded-md"
          >
            <h1 className="text-lg mb-3">{item.paper_title}</h1>
            <p className="mb-5 opacity-50">{dateConverter(item.created_at)}</p>
            <Link
              href={`/notes/${item.paper_id}`}
              className="border px-4 py-2 rounded-md hover:bg-[#000] hover:text-[#fff] duration-150"
            >
              Read Notes
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const supabase = createClientServer(context);

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (err) {
    return {
      props: {},
    };
  }
}
