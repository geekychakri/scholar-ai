import type { FallbackProps } from "react-error-boundary";

export default function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div role="alert" className="p-4 flex flex-col gap-3">
      <p>Something went wrong</p>
      <button className="border p-4" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}
