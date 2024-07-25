import { useState } from "react";

import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

export default function EditorToolbar({
  note,
  paperId,
}: {
  note: string;
  paperId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);

  const supabase = createClient();

  const p = () => new Promise((resolve, request) => setTimeout(resolve, 2000));

  const addNote = async () => {
    console.log(note);

    setIsLoading(true);

    toast.promise(
      async () => {
        const { error } = await supabase
          .from("notes")
          .insert({ note, paper_id: paperId });
      },
      {
        loading: "Loading...",
        success: (data) => {
          setIsLoading(false);
          setShowUpdateBtn(true);
          return `Saved`;
        },
        error: () => {
          setIsLoading(false);
          return "Error";
        },
        className: "toast",
        duration: 2000,
      }
    );
  };

  const updateNote = () => {
    console.log(note);

    setIsLoading(true);

    toast.promise(
      async () => {
        const { error } = await supabase
          .from("notes")
          .update({ note })
          .eq("id", "fe9ddc86-cb59-4307-91c5-b3ce02d9af2f"); //TODO:
      },
      {
        loading: "Loading...",
        success: (data) => {
          setIsLoading(false);
          setShowUpdateBtn(true);
          return `Saved`;
        },
        error: () => {
          setIsLoading(false);
          return "Error";
        },
        className: "toast",
        duration: 2000,
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span>Notepad</span>
        <span className="inline-block text-sm bg-black text-white p-1 rounded-md">
          M<span>&darr;</span> supported
        </span>
      </div>
      <button
        className="border-2 border-black rounded-md w-[100px] p-2 disabled:opacity-50"
        disabled={isLoading}
        onClick={showUpdateBtn ? updateNote : addNote}
      >
        {showUpdateBtn ? "Update" : "Save"}
      </button>
    </>
  );
}
