import Navbar from "../Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      {children}
    </div>
  );
}
