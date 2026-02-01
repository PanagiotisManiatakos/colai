import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-viewport">
      <div className="app-content">
        <div className="app-card p-4">
          <h1 className="h5 mb-2">Page not found</h1>
          <p className="text-secondary mb-3">
            The page you are looking for doesn't exist.
          </p>
          <Link href="/" className="btn btn-primary w-100">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
