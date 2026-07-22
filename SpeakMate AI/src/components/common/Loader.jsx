export function Loader({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      {label}
    </div>
  );
}

export default Loader;
