// Below code is from https://nextjs.org/docs/app/getting-started/error-handling
// and is styled.

"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2>Something went wrong!</h2>
      <button
        className="paragraph-medium mt-5 min-h-[46px] rounded-lg bg-primary-100 px-4 py-3 text-light-900 hover:bg-primary-100"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
