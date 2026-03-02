import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neu-50/80 backdrop-blur-sm">
      <div className="animate-spin-slow">
        <Image
          src="/logos/loader.svg"
          alt="Chargement"
          width={56}
          height={56}
          priority
        />
      </div>
    </div>
  );
}
