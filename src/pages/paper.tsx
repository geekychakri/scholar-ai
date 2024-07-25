import { useState, useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TipTap from "@/components/Editor";

import { GripVerticalIcon } from "lucide-react";

import useSWRImmutable from "swr/immutable";

import { setCookie } from "cookies-next";

import ChatBox from "@/components/ChatBox";

import { PaperType } from "@/types";
import { Spinner } from "@/SVG/Spinner";

const DisplayPDF = dynamic(() => import("@/components/DisplayPDF"), {
  ssr: false,
});

export default function Paper({ data }: { data: PaperType }) {
  const [fileUrl, setFileUrl] = useState("");
  const [showPDF, setShowPDF] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.blob());

  const {
    data: blob,
    error,
    isLoading,
    mutate,
  } = useSWRImmutable(`/api/downloadPDF?id=${data?.paperId}`, fetcher);

  console.log({ blob });

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setShowPDF(true);
    }
  }, [blob]);

  const handlePDF = async () => {
    console.log("PDF start");
    const res = await fetch("/api/downloadPDF", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfUrl: data.openAccessPdf?.url,
        // pdfUrl: "https://bitcoin.org/bitcoin.pdf",
      }),
    });
    const blob = await res.blob();
    console.log(blob);
    const url = URL.createObjectURL(blob);
    console.log(url);
    setFileUrl(url);
    setShowPDF(true);
  };
  return (
    <>
      <PanelGroup direction="horizontal">
        <Panel className="" defaultSize={30}>
          <div className="overflow-auto w-full h-full">
            {isLoading && (
              <div className="bg-blue-300 flex items-center justify-center w-full h-full">
                <Spinner />
              </div>
            )}
            {showPDF && <DisplayPDF fileUrl={fileUrl} />}
          </div>
        </Panel>
        <PanelResizeHandle className="mx-1 w-2 bg-gray-200 flex items-center justify-center">
          <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300">
            <GripVerticalIcon />
          </div>
        </PanelResizeHandle>
        <Panel className="rounded-lg" defaultSize={30}>
          <div className="overflow-auto w-full h-full p-2 text-lg flex flex-col gap-5">
            <h2 className="font-medium">{data?.title}</h2>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium">Authors</h2>
              <div className="flex gap-3 overflow-auto">
                {data?.authors.map((author, index) => (
                  <span key={index} className="text-sm flex-shrink-0">
                    {author.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex  flex-col gap-2">
              <h2 className="text-base font-medium">TLDR</h2>
              <p className="text-sm leading-relaxed">{data.tldr?.text}</p>
            </div>

            <ChatBox />
          </div>
        </Panel>
        <PanelResizeHandle className="mx-1 w-2 bg-gray-200 flex items-center justify-center">
          <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300">
            <GripVerticalIcon />
          </div>
        </PanelResizeHandle>
        <Panel className="rounded-lg" defaultSize={30}>
          <TipTap paperTitle={data?.title} paperId={data.paperId} />
        </Panel>
      </PanelGroup>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.query.id;

  const { req, res } = context;

  const response = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/${id}?fields=title,url,year,authors,abstract,isOpenAccess,openAccessPdf,publicationDate,tldr`,
    {
      headers: {
        "x-api-key": process.env.S2_API_KEY as string,
      },
    }
  );
  const data = await response.json();
  console.log(data);
  if (data.isOpenAccess) {
    const pdfUrl = data?.openAccessPdf.url;
    setCookie("pdfUrl", pdfUrl, { req, res, maxAge: 60 * 6 * 24 });
  }

  return {
    props: {
      data,
    },
  };
}
