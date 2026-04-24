export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="flex items-center gap-3 text-fg-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading…
      </div>
    </div>
  );
}
