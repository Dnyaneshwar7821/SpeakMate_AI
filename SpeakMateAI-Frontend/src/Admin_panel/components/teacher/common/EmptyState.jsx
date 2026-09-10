import Card from "@components/common/Card";

export function EmptyState({
    title,
    description,
    icon,
    action,
    className = "",
    titleAs = "h2",
    titleClassName = "text-base font-bold",
    descriptionClassName = "mt-1",
}) {
    const Title = titleAs;

    return (
        <Card className={`p-8 text-center sm:p-12 ${className}`}>
            {icon && (
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {icon}
                </span>
            )}
            <Title className={`${icon ? "mt-4" : ""} ${titleClassName} text-slate-950 dark:text-slate-100`}>
                {title}
            </Title>
            {description && (
                <p className={`${descriptionClassName} text-sm text-slate-500 dark:text-slate-400`}>{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </Card>
    );
}

export default EmptyState;
