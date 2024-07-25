import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import EditorToolbar from "../EditorToolbar";

const Editor = ({
  paperTitle,
  paperId,
}: {
  paperTitle: string;
  paperId: string;
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, Typography, Markdown],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-h1:text-lg sm:prose-base p-2 focus:outline-none  min-h-[500px]",
      },
    },
    content: `<h1>${paperTitle}</h1>`,
    immediatelyRender: false,
  });

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <EditorToolbar
          note={editor?.view.dom.innerHTML as string}
          paperId={paperId}
        />
      </div>
      <div className="h-full overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default Editor;
