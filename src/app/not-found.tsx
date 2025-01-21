import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <h2 className="mb-4 text-4xl font-bold">404 - Page Not Found</h2>
        <p className="mb-8 text-lg text-gray-600">
          Sorry, we could not find the page you are looking for.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
