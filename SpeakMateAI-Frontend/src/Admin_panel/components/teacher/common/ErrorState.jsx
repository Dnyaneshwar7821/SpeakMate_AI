import Card from "@components/common/Card";

export function ErrorState({
    title,
    description,
    icon,
    action,
    className = "",
    titleAs = "h2",
}) {
    const Title = titleAs;

    return (
        <Card
            className={`p-8 text-center sm:p-12 ${className}`}
            role="alert"
            aria-live="assertive"
        >
            {icon && (
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                    {icon}
                </span>
            )}
            <Title className={`${icon ? "mt-4" : ""} text-lg font-black text-slate-950 dark:text-slate-100`}>
                {title}
            </Title>
            {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </Card>
    );
}

export default ErrorState;
