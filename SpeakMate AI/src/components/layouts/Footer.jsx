export function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-base)] py-7 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between gap-6">
        <p className="text-sm text-[var(--text-muted)]">
          Copyright {new Date().getFullYear()} SpeakMate AI. Built for accelerated English fluency.
        </p>
        <div className="mt-4 sm:mt-0 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
