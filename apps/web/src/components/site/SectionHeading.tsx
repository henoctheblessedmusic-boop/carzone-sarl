interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left", id }: SectionHeadingProps) {
  return (
    <div className={`site-section-heading site-section-heading--${align}`}>
      {eyebrow ? <p className="site-eyebrow">{eyebrow}</p> : null}
      <h2 className="site-section-title" id={id}>
        {title}
      </h2>
      {subtitle ? <p className="site-section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
