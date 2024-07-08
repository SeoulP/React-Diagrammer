export type ContextOptionProps = {
    id: number;
    title: string;
    onClick?: () => void;
};

export function ContextOption({ id, title }: ContextOptionProps) {
    return (
        <div className={"text-sm hover:bg-violet-200 text-right p-1"} id={id.toString()}>
            {title}
        </div>
    );
}