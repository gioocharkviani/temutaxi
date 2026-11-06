"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">პანელი ვერ ჩაიტვირთა</h1>
      <p className="mt-3 text-muted">
        შეცდომის ზუსტი მიზეზი სერვერის ჟურნალშია (`npm run dev`-ის ტერმინალი). ასევე შეამოწმეთ, რომ Docker-ის ბაზა გაშვებულია.
      </p>
      <button type="button" onClick={reset} className="mt-6 h-12 rounded-2xl bg-ink px-6 font-semibold text-surface">
        თავიდან ცდა
      </button>
    </main>
  );
}
