import type { GetServerSidePropsContext } from "next";
import Head from "next/head";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server-props";

import PaperList from "@/components/PaperList";

const metaData = (
  <Head>
    <title>Papers</title>
    <meta name="description" content="papers" />
  </Head>
);

export default function Papers({ user }: { user: User }) {
  return (
    <>
      {metaData}
      <PaperList user={user} />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const { data, error } = await supabase.auth.getUser();

  console.log({ data });

  if (error || !data) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
}
