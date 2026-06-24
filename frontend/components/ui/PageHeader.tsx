import { ReactNode } from "react";
import { BackButton } from "./BackButton";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, showBack, children }: Props) {
  return (
    <div className="bg-white px-4 h-16 flex items-center gap-3">
      {showBack && <BackButton />}
      {children ? (
        children
      ) : (
        <div>
          {subtitle && (
            <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
              {subtitle}
            </p>
          )}
          <h1 className="text-navy font-bold text-lg leading-tight">{title}</h1>
        </div>
      )}
    </div>
  );
}
