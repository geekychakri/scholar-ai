import type { NextApiRequest, NextApiResponse } from "next";

import createClient from "@/utils/supabase/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isLocalEnv = process.env.NODE_ENV === "development";

  const getProdURL = () => {
    let url;
    if (process?.env?.NEXT_PUBLIC_SITE_URL) {
      url = `https://${process?.env?.NEXT_PUBLIC_SITE_URL}`;
    } else if (process?.env?.NEXT_PUBLIC_VERCEL_URL) {
      url = `https://${process?.env?.NEXT_PUBLIC_VERCEL_URL}`;
    }
    return url;
  };

  const BASE_URL = isLocalEnv ? "http://localhost:3000" : getProdURL();
  console.log(BASE_URL);

  const { searchParams, origin } = new URL(req.url as string, BASE_URL);

  try {
    console.log({ origin });
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/search";

    if (code) {
      const supabase = createClient(req, res);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = req.headers["x-forwarded-host"]; // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return res.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return res.redirect(`https://${forwardedHost}${next}`);
        } else {
          return res.redirect(`${origin}${next}`);
        }
      }
    }

    // return the user to an error page with instructions
    return res.redirect(`${origin}/auth/auth-code-error`);
  } catch (err) {
    res.redirect(`${origin}/auth/auth-code-error`);
  }
}
