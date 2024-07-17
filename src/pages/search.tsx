import { useRef } from "react";
import { useRouter } from "next/router";

import { Search as SearchIcon } from "react-feather";

export default function Search() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/papers?q=${searchRef.current?.value}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center p-2">
      <div className="w-full">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl">Search a research topic</h1>
          <p className="">
            Scholar will find relevance papers from 200 million papers
          </p>
        </div>

        <form
          className="mb-8 flex items-center justify-center gap-4 bg-white w-1/2 mx-auto border-2
     border-gray-200 rounded-md h-16 px-4 focus-within:border-black duration-200 max-lg:w-full"
          onSubmit={handleSubmit}
        >
          <span>
            <SearchIcon opacity={0.3} />
          </span>
          <span className="block border-l h-full"></span>

          <input
            id="question"
            type="text"
            className="flex-1 min-w-0 outline-none text-lg peer/question"
            placeholder="e.g. AI, Quantum Computing"
            ref={searchRef}
          />
          <button className="bg-[#121212] text-white font-medium px-4 py-2 rounded-md block peer-placeholder-shown/question:hidden">
            Search
          </button>
        </form>
      </div>
    </main>
  );
}