import type { NextApiRequest, NextApiResponse } from "next";
import createClientAPI from "@/utils/supabase/api";

import {
  SupabaseVectorStore,
  SupabaseFilterRPCCall,
} from "@langchain/community/vectorstores/supabase";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { ChatGroq } from "@langchain/groq";

import { createClient } from "@supabase/supabase-js";

import { PremEmbeddings } from "@langchain/community/embeddings/premai";

import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!supabaseKey) throw new Error(`Expected SUPABASE_SERVICE_ROLE_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

const embeddings = new PremEmbeddings({
  apiKey: process.env.PREM_API_KEY,
  project_id: Number(process.env.PREM_PROJECT_ID),
  model: "text-embedding-ada-002",
});

const model = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

type Data = {
  id?: any;
  msg?: string;
};

export const config = {
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 50,
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

    const { question, paperId } = req.body;

    console.log({ question, paperId });
    const client = createClient(url, supabaseKey);

    const funcFilterByCollection: SupabaseFilterRPCCall = (rpc) =>
      rpc.filter("metadata->>paperId", "eq", paperId); //TODO: filter by meta data

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      embeddings,
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
        filter: funcFilterByCollection,
      }
    );

    const retriever = vectorStore.asRetriever();

    const systemTemplate = [
      `You are an assistant for question-answering tasks. `,
      `Use the following pieces of retrieved context to answer `,
      `the question. If you don't know the answer, say that you `,
      `don't know. Use three sentences maximum and keep the `,
      `answer concise.`,
      `\n\n`,
      `{context}`,
    ].join("");

    //TODO:

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", "{input}"],
    ]);
    const questionAnswerChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });
    const ragChain = await createRetrievalChain({
      retriever,
      combineDocsChain: questionAnswerChain,
    });
    const results = await ragChain.invoke({
      input: question,
    });
    console.log(results);

    //TODO:

    res.status(200).json({ msg: results.answer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
}
