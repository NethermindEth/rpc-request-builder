import Builder from "../components/Builder";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen items-center justify-between lg:p-12 md:p-10 sm:py-10">
      <div className="flex m-5">
        <div className="lg:w-1/4"></div>
        <div className="text-center lg:w-1/2 sm:w-full">
          <div className="flex justify-center items-center my-5">
            <Image
              src="/nethermind-logo.png"
              alt="Nethermind Logo"
              width={200}
              height={200}
            />
          </div>
          <p className="lg:text-4xl text-3xl my-3 text-[#ff4b00] font-medium">
            Starknet RPC Request Builder
          </p>
          <p className="lg:text-lg text-sm">
            Easily build and test JSON RPC requests with Nethermind&apos;s
            free-to-use Starknet RPC Request API
          </p>
          <a
            href="https://voyager.online/?signin=true&utm_campaign=rpc-request-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ff4b00] hover:bg-[#ff7337] text-white font-medium text-sm px-3 py-2 rounded-lg my-5 inline-block text-center"
          >
            Get Started for Free
          </a>
        </div>
        <div className="lg:w-1/4"></div>
      </div>
      <Builder />
    </main>
  );
}
