import type { NextApiRequest, NextApiResponse } from "next";

import createClient from "@/utils/supabase/api";
import KeywordExtractor from "keyword-extractor";

import createClientAPI from "@/utils/supabase/api";

import { PaperType } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const clientAPI = createClientAPI(req, res);

    // Check if we have a session
    const { data: userData, error } = await clientAPI.auth.getUser();

    if (error || !userData) {
      return res.status(401).json({
        msg: "not_authenticated",
      });
    }
    const { query, index, year } = req.query;

    console.log({ query, index, year });

    const extraction_result = KeywordExtractor.extract(query as string, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: false,
    });

    const searchQuery = extraction_result.join(" ");

    const supabase = createClient(req, res);

    const fetchBookmarks = supabase.from("starred").select(); //TODO:

    const url = new URL(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURI(
        searchQuery as string
      )}&offset=${
        Number(index) * 10
      }&limit=10&fields=title,abstract,year,openAccessPdf,tldr,citationCount,authors&openAccessPdf`
    );

    if (year !== "undefined") {
      url.searchParams.set("year", year as string);
    }

    const fetchPapers = fetch(url, {
      headers: {
        "x-api-key": process.env.S2_API_KEY as string,
      },
    }).then((res) => res.json());

    const resolvedData = await Promise.all([fetchBookmarks, fetchPapers]);

    const bookmarks = resolvedData[0].data;
    const bookmarksIds = bookmarks?.map((paper) => paper?.paperId);

    const papers = resolvedData[1]?.data.map((paper: PaperType) => {
      const match = bookmarksIds?.includes(paper?.paperId);
      return { ...paper, isBookmarked: match ? true : false };
    });
    res.status(200).json(papers); //TODO:
  } catch (err) {
    res.status(500).json({ msg: "Something went wrong!" });
  }
}
