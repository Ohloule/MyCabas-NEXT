import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="py-4 bg-principale-800">
      <div className="align-center flex flex-col gap-y-2 md:gap-0  md:flex-row justify-between items-center h-full">
        <Link href="/markets" className="text-blanc hover:underline">
          Trouver un marché
        </Link>
        <Link href="/about" className="text-blanc hover:underline">
          Comment ça marche ?
        </Link>
        <Link href="/pricing" className="text-blanc hover:underline">
          Tarifs & fonctionnement
        </Link>
        <Link href={`/register`} className="text-blanc hover:underline">
          <Button className="bg-secondaire-500 hover:bg-secondaire-600">
            Inscription Gratuite
          </Button>
        </Link>
      </div>
    </nav>
  );
}
