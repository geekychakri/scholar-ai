import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";
import { usePapers } from "@/hooks/usePapers";

export default function PaperList({ user }: { user: any }) {
  const { papers, error, isLoading, isValidating, size, setSize } =
    usePapers(user);
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      Papers
      {JSON.stringify(papers, null, 2)}
    </div>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const { data, error } = await supabase.auth.getUser();

  console.log({ data });

  if (error || !data) {
    return {
      redirect: {
        destination: "/",
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
