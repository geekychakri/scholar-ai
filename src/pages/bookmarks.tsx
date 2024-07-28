import BookmarksList from "@/components/BookmarksList";
import Head from "next/head";

import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";

const metaData = (
  <Head>
    <title>Bookmarks</title>
    <meta name="description" content="bookmarks" />
  </Head>
);

export default function Bookmarks() {
  return (
    <>
      {metaData}
      <BookmarksList />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    } else {
      return {
        props: {},
      };
    }
  } catch (err) {}
}
