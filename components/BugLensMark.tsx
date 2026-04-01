import Image from "next/image";

export default function BugLensMark({ size = 32, className }: { size?: number, className?: string }) {
  return (
    <Image
      src="/BUGLENS_Llogo.png"
      alt="BugLens Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
