import Card from "@components/common/Card";

export function LoadingSkeleton({
    rows = 3,
    className = "",
    label = "Loading content",
}) {
    return (
        <Card
            className={`p-6 ${className}`}
            role="status"
            aria-label={label}
            aria-live="polite"
        >
            <span className="sr-only">{label}</span>
            <div className="animate-pulse motion-reduce:animate-none" aria-hidden="true">
                <div className="h-5 w-2/5 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-3/5 rounded bg-slate-100" />
                <div className="mt-6 space-y-3">
                    {Array.from({ length: rows }, (_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-slate-100" />
                    ))}
                </div>
            </div>
        </Card>
    );
}

export default LoadingSkeleton;
