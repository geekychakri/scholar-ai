import type { NextApiRequest, NextApiResponse } from "next";

import { getCookie } from "cookies-next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const { pdfUrl } = req.body;
  // console.log(pdfUrl);

  const pdfUrl = getCookie("pdfUrl", { req, res });
  if (!pdfUrl) {
    return res.status(500).send({ msg: "Something went wrong" });
  }

  try {
    const pdfResponse = await fetch(pdfUrl as string, {
      // signal: AbortSignal.timeout(8000),
    }); //TODO:

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

    // if (fileSizeInMegabytes > 4) {
    //   return res.status(500).send({ msg: "Something went wrong" });
    // }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    console.log(pdfBuffer);

    const binaryPdf = Buffer.from(pdfBuffer);

    res.setHeader("Content-Type", "text/pdf");

    res.status(200).send(binaryPdf);
  } catch (err) {
    res.status(500).send({ msg: "Something went wrong" });
  }
}
