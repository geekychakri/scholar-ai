import { useState } from "react";

import { memo } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Spinner } from "@/SVG/Spinner";

import { createClient } from "@/utils/supabase/component";

import { toast } from "sonner";

const Chat = dynamic(() => import("./Chat"), {
  ssr: false,
});

function ChatBox({
  fileUrl,
  isPDFShown,
}: {
  fileUrl: string;
  isPDFShown: boolean;
}) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [checkEmbed, setCheckEmbed] = useState(false);

  const supabase = createClient();

  const router = useRouter();

  const paperId = router.query.id as string;

  console.log({ isPDFShown });
  const handlePDFEmbed = async () => {
    try {
      setShowSpinner(true);

      const { data, count, error } = await supabase
        .from("documents")
        .select("", { count: "exact" })
        .contains("metadata", {
          paperId,
        });

      console.log({ count });
      if (error) {
        throw new Error("Something went wrong! Please try again later.");
      }

      //check if specific paper embeddings is already in db
      if ((count as number) >= 1) {
        console.log("Embeddings already exists!");
        setCheckEmbed(true);
        setShowSpinner(false);
        return;
      }

      const file = await fetch(fileUrl);

      const blobData = await file.blob();

      console.log({ blobData });

      const formData = new FormData();

      formData.append("blob", blobData);
      formData.append("id", paperId);

      const res = await fetch("/api/embedPaper", {
        method: "POST",
        body: formData,
      });
      if (!res.ok)
        throw new Error("Something went wrong! Please try again later.");

      const embData = await res.json();
      console.log(embData);
      setCheckEmbed(true);
      setShowSpinner(false);
    } catch (err) {
      let message: string;
      if (err instanceof Error) message = err.message;
      else message = String(err);
      toast.error(message);
      console.log(String(err));
      setShowSpinner(false);
    }
  };

  return (
    <>
      {checkEmbed ? (
        <Chat paperId={paperId} />
      ) : (
        <div className="min-h-[200px] flex-1 flex items-center justify-center border-t">
          <button
            disabled={!isPDFShown}
            className="w-[200px] h-[50px] flex items-center justify-center border px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handlePDFEmbed}
          >
            {!showSpinner ? (
              <span>Chat with paper</span>
            ) : (
              <span>
                <Spinner width={20} height={20} />
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}

export default memo(ChatBox);
