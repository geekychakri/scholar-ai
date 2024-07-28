import { useState, useEffect } from "react";
import type { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@/components/Editor";

import { useMediaQuery } from "react-responsive";

import { GripVerticalIcon, Link2 } from "lucide-react";

import useSWRImmutable from "swr/immutable";

import { setCookie } from "cookies-next";

import ChatBox from "@/components/ChatBox";

import { PaperType } from "@/types";
import { Spinner } from "@/SVG/Spinner";

import { createClient } from "@/utils/supabase/server-props";

const DisplayPDF = dynamic(() => import("@/components/DisplayPDF"), {
  ssr: false,
});

class StatusError extends Error {
  info: string | undefined;
  status: number | undefined;
}

const metaData = (
  <Head>
    <title>Paper</title>
    <meta name="description" content="paper" />
  </Head>
);

export default function Paper({
  data,
  note,
}: {
  data: PaperType;
  note: string;
}) {
  const [fileUrl, setFileUrl] = useState("");
  const [showPDF, setShowPDF] = useState(false);

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
      const error = new StatusError(
        "An error occurred while fetching the data."
      );

      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.blob();
  };

  const {
    data: blob,
    error,
    isLoading,
  } = useSWRImmutable(`/api/downloadPDF?id=${data?.paperId}`, fetcher, {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Never retry on 500
      if (error.status === 500) return;
    },
  });

  console.log({ blob });

  console.log(error?.status);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setShowPDF(true);
    }
  }, [blob]);

  return (
    <>
      {metaData}
      <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <Panel className="" defaultSize={30}>
          <div className="overflow-auto w-full h-full">
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <Spinner />
              </div>
            )}
            {showPDF && <DisplayPDF fileUrl={fileUrl} />}

            {error && (
              <div className="flex flex-col gap-3 p-2">
                <h1 className="font-medium text-lg">Abstract</h1>
                <p className="text-base">
                  {data?.abstract ? data.abstract : data.tldr?.text}
                </p>
              </div>
            )}
          </div>
        </Panel>
        {isMobile ? (
          <PanelResizeHandle className="mx-1 h-2 w-full bg-gray-200 flex items-center justify-center">
            <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300 rotate-90">
              <GripVerticalIcon />
            </div>
          </PanelResizeHandle>
        ) : (
          <PanelResizeHandle className="mx-1 w-2 bg-gray-200 flex items-center justify-center">
            <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300">
              <GripVerticalIcon />
            </div>
          </PanelResizeHandle>
        )}
        <Panel className="rounded-lg" defaultSize={30}>
          <div className="overflow-auto w-full h-full p-2 text-lg flex flex-col gap-5">
            <h2 className="font-medium">{data?.title}</h2>
            <div>
              {data.isOpenAccess && (
                <a
                  href={data?.openAccessPdf?.url}
                  className="text-sm flex items-center gap-1 underline"
                >
                  <span>
                    <Link2 />
                  </span>
                  <span>PDF</span>
                </a>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium">Authors</h2>
              <div className="flex gap-3 overflow-auto">
                {data?.authors?.map((author, index) => (
                  <span key={index} className="text-sm flex-shrink-0">
                    {author.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex  flex-col gap-2">
              {data?.tldr ? (
                <>
                  <h2 className="text-base font-medium">TLDR</h2>
                  <p className="text-sm leading-relaxed">{data.tldr?.text}</p>
                </>
              ) : null}
            </div>

            <ChatBox fileUrl={fileUrl} isPDFShown={showPDF} />
          </div>
        </Panel>
        {isMobile ? (
          <PanelResizeHandle className="mx-1 h-2 w-full bg-gray-200 flex items-center justify-center">
            <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300 rotate-90">
              <GripVerticalIcon />
            </div>
          </PanelResizeHandle>
        ) : (
          <PanelResizeHandle className="mx-1 w-2 bg-gray-200 flex items-center justify-center">
            <div className="z-10 w-5 h-8 rounded-sm flex items-center justify-center bg-gray-300">
              <GripVerticalIcon />
            </div>
          </PanelResizeHandle>
        )}
        <Panel className="rounded-lg" defaultSize={30}>
          <Editor
            paperTitle={data?.title}
            paperId={data?.paperId}
            note={note}
          />
        </Panel>
      </PanelGroup>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const id = context.query.id;

  const { req, res } = context;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const getPaper = fetch(
      `https://api.semanticscholar.org/graph/v1/paper/${id}?fields=title,url,year,authors,abstract,isOpenAccess,openAccessPdf,publicationDate,tldr`,
      {
        headers: {
          "x-api-key": process.env.S2_API_KEY as string,
        },
      }
    ).then((res) => res.json());

    const getNote = supabase
      .from("notes")
      .select("note")
      .eq("paper_id", id)
      .limit(1)
      .single();

    const resolvedData = await Promise.all([getPaper, getNote]);
    console.log(resolvedData);
    // const data = await response.json();
    // console.log(data);
    if (resolvedData[0].isOpenAccess) {
      const pdfUrl = resolvedData[0]?.openAccessPdf?.url;
      setCookie("pdfUrl", pdfUrl, { req, res, maxAge: 60 * 6 * 24 });
    }

    return {
      props: {
        data: resolvedData[0],
        note: resolvedData[1]?.data?.note || null, //TODO:
      },
    };
  } catch (err) {
    return {
      props: {
        data: {},
        note: null,
      },
    };
  }
}
