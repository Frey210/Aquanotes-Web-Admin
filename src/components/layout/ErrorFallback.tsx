import { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-atmosphere flex items-center justify-center px-6">
      <div className="glass-panel rounded-3xl p-8 shadow-card max-w-lg">
        <h2 className="font-display text-xl mb-2">Something went wrong</h2>
        <p className="text-sm text-muted mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Reload</Button>
      </div>
    </div>
  );
}
