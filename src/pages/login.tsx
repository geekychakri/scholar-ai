import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { GitHub, User } from "react-feather";

import { createClient } from "@/utils/supabase/component";

import { Spinner } from "@/SVG/Spinner";

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export default function Login() {
  const [showSpinner, setShowSpinner] = useState(false);

  const router = useRouter();
  const supabaseClient = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabaseClient.auth.getUser();
      if (data.user) {
        router.push("/");
      }
    };
    checkUser();
  }, []);

  const handleGithubLogin = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getURL(),
      },
    });
  };
  const handleGuestLogin = async () => {
    setShowSpinner(true);
    const { data, error } = await supabaseClient.auth.signInAnonymously();

    console.log({ data });

    if (data) {
      router.push("/");
    } else if (error) {
      setShowSpinner(false);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="flex-1 border-r-2 border-black sm:border-none flex justify-center items-center">
      <div className="flex flex-col gap-5 w-2/5 max-sm:w-full p-7">
        <h1 className="text-2xl font-medium">Get started</h1>
        <button
          className="bg-[#121212] border text-white px-4 py-2 rounded-md flex items-center gap-4 hover:bg-transparent hover:text-black hover:border-black duration-200"
          onClick={handleGithubLogin}
        >
          <GitHub size={32} />
          <span className="flex-1">
            Continue with <span className="font-medium">GitHub</span>
          </span>
        </button>
        <button
          className="border px-4 py-2 rounded-md flex items-center gap-4 hover:border-black duration-200"
          onClick={handleGuestLogin}
        >
          <User size={32} className="" />
          <span className="flex-1 flex items-center justify-center gap-2">
            {showSpinner ? (
              <span>
                <Spinner width={20} />
              </span>
            ) : (
              <span>
                Continue as <b>Guest</b>
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
