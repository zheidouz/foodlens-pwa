export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-emerald-50 to-white font-sans dark:from-emerald-950 dark:to-black">
      <main className="flex flex-1 w-full max-w-md flex-col items-center justify-center gap-12 px-6 text-center">
        {/* Logo / Icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>

        {/* Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            FoodLens
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Tap to Scan
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
            Point your camera at any food product for an honest
            Good &amp; Bad review.
          </p>
        </div>

        {/* Scan Button (placeholder) */}
        <button
          disabled
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed dark:shadow-emerald-900/30"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23a3.42 3.42 0 0 0-.1 5.884 2.31 2.31 0 0 1 1.641 1.055M12 8.25V12m0 0v3.75M12 12h3.75M3.75 12h3.75m9 0h3.75M12 3.75v3.75m0 0V3.75M12 12l2.25 2.25m-4.5 0L12 12" />
          </svg>
          Scan Food
        </button>

        {/* Feature teasers */}
        <div className="grid grid-cols-3 gap-4 w-full text-center text-xs text-zinc-500 dark:text-zinc-500">
          <div className="space-y-1">
            <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p>Camera</p>
          </div>
          <div className="space-y-1">
            <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50">
              <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              </svg>
            </div>
            <p>Barcode</p>
          </div>
          <div className="space-y-1">
            <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <p>Upload</p>
          </div>
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-zinc-400">
        <p>Coming soon &mdash; camera scanning &amp; barcode lookup</p>
      </footer>
    </div>
  );
}

