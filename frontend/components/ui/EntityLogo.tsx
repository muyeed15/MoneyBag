import Image from "next/image";

export function EntityLogo({
  logo,
  name,
  className,
}: {
  logo?: string | null;
  name: string;
  className?: string;
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={name}
        width={48}
        height={48}
        unoptimized
        className={`h-12 w-12 object-contain ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`h-12 w-12 bg-teal rounded-2xl flex items-center justify-center shrink-0 ${className ?? ""}`}
    >
      <span className="text-white font-bold text-base">{name.charAt(0)}</span>
    </div>
  );
}
