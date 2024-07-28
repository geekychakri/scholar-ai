import type { NextApiRequest, NextApiResponse } from "next";

import createClientAPI from "@/utils/supabase/api";

import { getCookie } from "cookies-next";

export const config = {
  maxDuration: 30,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClientAPI(req, res);

  // Check if we have a session
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData) {
    return res.status(401).json({
      msg: "not_authenticated",
    });
  }
  const pdfUrl = getCookie("pdfUrl", { req, res });
  if (!pdfUrl) {
    return res.status(500).send({ msg: "Something went wrong" });
  }

  try {
    const pdfResponse = await fetch(pdfUrl as string, {
      signal: AbortSignal.timeout(15 * 1000),
    }); //TODO:

    console.log(pdfResponse);

    if (!pdfResponse.ok) {
      return res.status(500).send({ msg: "Something went wrong" });
    }

    const contentType = pdfResponse.headers.get("content-type");

    console.log({ contentType });

    const contentLength = pdfResponse.headers.get("Content-Length");

    const fileSizeInBytes = parseInt(contentLength as string, 10);
    const fileSizeInKilobytes = fileSizeInBytes / 1024;
    const fileSizeInMegabytes = fileSizeInKilobytes / 1024;

    console.log(`File size: ${fileSizeInMegabytes} MB`);

    if (fileSizeInMegabytes > 4) {
      return res.status(500).send({ msg: "Something went wrong" });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    console.log(pdfBuffer);

    const binaryPdf = Buffer.from(pdfBuffer);

    res.setHeader("Content-Type", "application/pdf");

    res.status(200).send(binaryPdf);
  } catch (err) {
    res.status(500).send({ msg: "Something went wrong" });
  }
}
