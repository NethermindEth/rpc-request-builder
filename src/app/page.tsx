import Builder from "../components/Builder";

export default function Home() {
  return (
    <main className="min-h-screen items-center justify-between p-24">
      <div className="text-2xl text-center m-5">RPC Request Builder</div>
      <Builder />
    </main>
  );
}
