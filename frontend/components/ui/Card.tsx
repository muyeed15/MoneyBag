import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

export function Card({ children, className = "", padding = true }: Props) {
  return (
    <div
      className={`bg-white border border-sage-mid rounded-xl ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
