interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) => (
  <div className="flex items-start justify-between gap-6 mb-8">
    <div className="min-w-0">
      <span className="inline-block uppercase tracking-wide text-[12px] font-medium px-3 py-1 rounded-full bg-pink-50 text-pink-600 mb-4">
        {eyebrow}
      </span>
      <h1 className="font-serif font-normal text-[36px] leading-[1.15] text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-[14.5px] leading-[1.5] text-ink-muted max-w-[60ch]">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
