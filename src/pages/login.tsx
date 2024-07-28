import { useRouter } from "next/router";
import Head from "next/head";
import { useState } from "react";

import type { GetServerSidePropsContext } from "next";

import { Github } from "lucide-react";

import { createClient } from "@/utils/supabase/server-props";
import { createClient as supabaseComponentClient } from "@/utils/supabase/component";

import { Spinner } from "@/SVG/Spinner";
import { toast } from "sonner";

const getURL = () => {
  let url;

  if (process?.env?.NEXT_PUBLIC_SITE_URL) {
    url = `${process?.env?.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
  } else if (process?.env?.NEXT_PUBLIC_VERCEL_URL) {
    url = `${process?.env?.NEXT_PUBLIC_VERCEL_URL}/api/auth/callback`;
  } else {
    url = "http://localhost:3000/api/auth/callback";
  }
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

const metaData = (
  <Head>
    <title>Login</title>
    <meta name="description" content="login" />
  </Head>
);

export default function Login() {
  const [showSpinner, setShowSpinner] = useState(false);

  const router = useRouter();

  const supabase = supabaseComponentClient();

  const handleGithubLogin = async () => {
    console.log(getURL());
    setShowSpinner(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getURL(),
      },
    });
    if (error) {
      setShowSpinner(false);
      toast.error("Something went wrong!");
      setTimeout(() => {
        router.push("/");
      }, 4000);
    }
  };

  return (
    <>
      {metaData}
      <div className="flex-1 border-r-2 border-black sm:border-none flex justify-center items-center">
        <div className="flex flex-col gap-5 w-2/5 max-sm:w-full p-7">
          <h1 className="text-2xl font-medium">Get started</h1>
          <button
            className="bg-[#121212] border text-white px-4 py-2 rounded-md flex items-center gap-4 hover:bg-transparent hover:text-black hover:border-black duration-200"
            onClick={handleGithubLogin}
          >
            <Github size={32} />
            <span className="flex-1 flex gap-2 items-center justify-center">
              <span>
                Continue with <span className="font-medium">GitHub</span>
              </span>
              {showSpinner && (
                <span>
                  <Spinner width={20} />
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  try {
    const { data, error } = await supabase.auth.getUser();

    if (data?.user) {
      return {
        redirect: {
          destination: "/search",
          permanent: false,
        },
      };
    } else {
      return {
        props: {},
      };
    }
  } catch (err) {
    return {
      props: {},
    };
  }
}
