import { GetServerSidePropsContext } from "next";

import Editor from "@/components/Editor";

import { createClient } from "@/utils/supabase/server-props";

type NoteType = {
  note: string;
  paper_title: string;
  paper_id: string;
};

export default function Note({ note }: { note: NoteType }) {
  if (!note) {
    return <div className="p-6">Note not found!</div>;
  }
  return (
    <div className="w-1/2 mx-auto max-sm:w-full border my-8 rounded-md max-sm:border-none">
      <h1 className="border-b p-4">Title: {note?.paper_title}</h1>
      <Editor
        paperTitle={note?.paper_title}
        paperId={note?.paper_id}
        note={note?.note}
      />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params;

  console.log(params?.id);

  try {
    const supabase = createClient(context);

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const { data: note, error } = await supabase
      .from("notes")
      .select()
      .eq("paper_id", params?.id)
      .limit(1)
      .single();

    console.log(note);

    return {
      props: {
        note,
      },
    };
  } catch (err) {
    return {
      props: {},
    };
  }
}
