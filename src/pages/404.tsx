import Link from "next/link";

export default function Custom404() {
  return (
    <div className="h-full flex flex-col gap-4 items-center justify-center">
      <h1 className="text-xl font-medium">404 - Page Not Found</h1>
      <Link href="/search" className="bg-black text-white p-3 rounded-md">
        Search Research Papers
      </Link>
    </div>
  );
}
