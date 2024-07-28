import type { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import multiparty from "multiparty";
import { PremEmbeddings } from "@langchain/community/embeddings/premai";

import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

import createClientAPI from "@/utils/supabase/api";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!supabaseKey) throw new Error(`Expected SUPABASE_SERVICE_ROLE_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

export const config = {
  api: {
    bodyParser: false,
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 50,
};

type ProcessedFormData = {
  files: any;
  fields: any;
};

const embeddings = new PremEmbeddings({
  apiKey: process.env.PREM_API_KEY,
  project_id: Number(process.env.PREM_PROJECT_ID),
  model: "embed-multilingual",
});

type Data = {
  id?: any;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const supabase = createClientAPI(req, res);

    // Check if we have a session
    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData) {
      return res.status(401).json({
        msg: "not_authenticated",
      });
    }
    const client = createClient(url, supabaseKey, {
      auth: { persistSession: false },
    });
    //TODO:
    const form = new multiparty.Form();
    const formData = await new Promise<ProcessedFormData>((resolve, reject) => {
      form.parse(req, function (err, fields, files) {
        if (err) reject({ err });
        resolve({ fields, files });
      });
    });
    console.log(formData);
    const paperId = formData.fields.id[0];
    const pdfFile = fs.readFileSync(formData.files.blob[0].path);
    console.log(pdfFile);
    const blob = new Blob([pdfFile]);
    // const loader = new PDFLoader(filePath);
    const loader = new PDFLoader(blob);
    const rawDocs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, //TODO:
      chunkOverlap: 20,
    });
    const newDocs = rawDocs.map((doc) => {
      return {
        pageContent: doc.pageContent,
        metadata: { ...doc.metadata, paperId },
      };
    });
    const docs = await textSplitter.splitDocuments(newDocs);

    console.log({ docs });

    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    res.status(200).json({ msg: "Embedded Successfully!" });
  } catch (err) {
    res.status(500).json({ msg: "Something went wrong" });
  }
}
