import BookmarksList from "@/components/BookmarksList";

import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";

export default function Bookmarks() {
  return <BookmarksList />;
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
