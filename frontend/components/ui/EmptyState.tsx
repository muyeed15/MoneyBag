import { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon, message, action }: Props) {
  return (
    <div className="bg-white border border-sage-mid px-6 py-16 text-center rounded-xl">
      {icon && <div className="mb-3 flex justify-center text-navy-muted">{icon}</div>}
      <p className="text-navy font-semibold mb-4">{message}</p>
      {action}
    </div>
  );
}
