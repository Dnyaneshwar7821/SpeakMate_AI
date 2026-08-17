export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-slate-400">
        <p>Copyright {new Date().getFullYear()} SpeakMate AI. All rights reserved.</p>
        <p>Practice English with calm, focused AI coaching.</p>
      </div>
    </footer>
  );
}

export default Footer;
