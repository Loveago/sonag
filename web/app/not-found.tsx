import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="text-center">
        <div className="text-6xl font-semibold">404</div>
        <p className="mt-2 text-fg-muted">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary mt-5 inline-flex">Back home</Link>
      </div>
    </div>
  );
}
