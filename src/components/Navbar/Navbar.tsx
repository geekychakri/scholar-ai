import Link from "next/link";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/component";

import { Bookmark, LogOut, NotebookPen } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const supabase = createClient();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="flex max-sm:flex-wrap max-sm:gap-3 justify-between shadow-sm px-6 py-4 [&>*]:animate-fade-in-up">
      <Link href="/" className="font-semibold text-xl">
        Scholar<span className="text-[#fa612e]">AI</span>.
      </Link>

      {router.pathname === "/" && (
        <div className="flex gap-5">
          <Link href="/login">Log In</Link>
          <Link href="/login">Sign Up</Link>
        </div>
      )}

      {["/search", "/paper", "/papers", "/404", "/notes/[id]"].includes(
        router.pathname
      ) && (
        <div className="flex gap-6 max-sm:gap-4 max-sm:flex-wrap">
          <Link href="/bookmarks" className="flex items-center gap-2">
            <span>
              <Bookmark size={18} />
            </span>
            <span>Bookmarks</span>
          </Link>

          <Link href="/notes" className="flex items-center gap-2">
            <span>
              <NotebookPen size={18} />
            </span>
            <span>Notes</span>
          </Link>

          <button onClick={signOut} className="flex items-center gap-2">
            <span>
              <LogOut size={18} />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      )}

      {["/bookmarks"].includes(router.pathname) && (
        <div className="flex gap-6">
          <Link href="/notes" className="flex items-center gap-2">
            <span>
              <Bookmark size={18} />
            </span>
            <span>Notes</span>
          </Link>

          <button onClick={signOut} className="flex items-center gap-2">
            <span>
              <LogOut size={18} />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      )}

      {["/notes"].includes(router.pathname) && (
        <div className="flex gap-6">
          <Link href="/bookmarks" className="flex items-center gap-2">
            <span>
              <Bookmark size={18} />
            </span>
            <span>Bookmarks</span>
          </Link>

          <button onClick={signOut} className="flex items-center gap-2">
            <span>
              <LogOut size={18} />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
