import { useState } from "react";

import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

import type { Editor } from "@tiptap/react";

export default function EditorToolbar({
  editor,
  paperId,
  paperTitle,
  isUserNoteExists,
}: {
  editor: Editor;
  paperId: string;
  paperTitle: string;
  isUserNoteExists: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);

  const supabase = createClient();

  const addNote = async () => {
    console.log(editor.getHTML());

    const note = editor.getHTML();

    setIsLoading(true);

    toast.promise(
      async () => {
        const { error } = await supabase
          .from("notes")
          .insert({ note, paper_id: paperId, paper_title: paperTitle });
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
    const note = editor.getHTML();

    console.log(note);
    console.log(paperId);

    setIsLoading(true);

    toast.promise(
      async () => {
        const { error } = await supabase
          .from("notes")
          .update({ note })
          .eq("paper_id", paperId);
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
    <div className="flex items-center justify-between px-4 py-4 border-b flex-wrap gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span>Notepad</span>
        <span className="inline-block text-sm bg-black text-white p-1 rounded-md">
          M<span>&darr;</span> supported
        </span>
      </div>
      <button
        className="border-2 border-black rounded-md w-[100px] p-2 disabled:opacity-50"
        disabled={isLoading}
        onClick={isUserNoteExists || showUpdateBtn ? updateNote : addNote}
      >
        {isUserNoteExists || showUpdateBtn ? "Update" : "Save"}
      </button>
    </div>
  );
}
