import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "../EditorToolbar";

const TipTapEditor = ({
  paperTitle,
  paperId,
  note,
}: {
  paperTitle: string;
  paperId: string;
  note: string;
}) => {
  console.log({ note });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Markdown,
      Placeholder.configure({
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-[#adb5bd] before:h-0 before:pointer-events-none",
        placeholder: "Write something …",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-h1:text-lg sm:prose-base px-4 py-2 focus:outline-none  min-h-[500px]",
      },
    },
    content: note || "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <>
      <EditorToolbar
        isUserNoteExists={Boolean(note) ? true : false}
        editor={editor as Editor}
        paperId={paperId}
        paperTitle={paperTitle}
      />

      <div className="h-full overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default TipTapEditor;
