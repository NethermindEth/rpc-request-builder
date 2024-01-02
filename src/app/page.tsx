import Builder from "../components/Builder";

export default function Home() {
  return (
    <main className="min-h-screen items-center justify-between lg:p-24 md:p-12 sm:py-10">
      <div className="lg:text-2xl text-xl text-center m-5">
        RPC Request Builder
      </div>
      <Builder />
    </main>
  );
}
