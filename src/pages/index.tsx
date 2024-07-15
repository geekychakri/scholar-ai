import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto flex-1 flex items-center">
      <div className="flex flex-col items-center max-sm:items-stretch gap-12 max-sm:px-4">
        <h1 className="flex flex-col gap-6 text-center max-sm:text-left">
          <span className="text-8xl max-sm:text-7xl tracking-tighter font-semibold animate-fade-in-up">
            The AI Research <span className="text-[#fa612e]">Assistant.</span>
          </span>
          <span className="text-lg text-gray-600 font-medium">
            Scholar helps connect users to peer-reviewed research articles.
          </span>
        </h1>
        <div className="flex max-sm:flex-col max-sm:gap-4 gap-8">
          <Link
            href="/login"
            className="border text-lg px-12 py-3 rounded-md bg-[#121212] text-white hover:bg-transparent hover:text-black hover:border-black max-sm:text-center duration-150"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
