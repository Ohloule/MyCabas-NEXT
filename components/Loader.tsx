import Image from "next/image";

interface LoaderProps {
  taille: number;
}

export default function Loader({ taille }: LoaderProps) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin-slow">
        <Image
          src="/logos/loader.svg"
          alt="Chargement"
          width={taille}
          height={taille}
          priority
        />
      </div>
    </div>
  );
}
