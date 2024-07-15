import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between shadow-sm px-6 py-4 [&>*]:animate-fade-in-up">
      <Link href="/" className="font-semibold text-xl">
        Scholar<span className="text-[#fa612e]">AI</span>.
      </Link>
    </nav>
  );
}
