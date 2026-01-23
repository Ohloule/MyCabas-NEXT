"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export default function HeroSectionForm() {
  const [selectedRole, setSelectedRole] = useState<"client" | "vendor">(
    "client",
  );
  return (
    <div className="flex flex-col gap-3 pt-4">
      <RadioGroup
        value={selectedRole}
        onValueChange={(value) => setSelectedRole(value as "client" | "vendor")}
      >
        <div className="flex items-center space-x-2 bg-secondaire-50 px-3 rounded-2xl">
          <RadioGroupItem value="client" id="client" />
          <Label htmlFor="client" className="cursor-pointer w-full py-3">
            Consommateurs
          </Label>
        </div>
        <div className="flex items-center space-x-2 bg-secondaire-50 px-3 rounded-2xl">
          <RadioGroupItem value="vendor" id="vendor" />
          <Label htmlFor="vendor" className="cursor-pointer w-full py-3">
            Commerçants
          </Label>
        </div>
      </RadioGroup>

      <Link href={`/register`}>
        <Button className="bg-secondaire-500 hover:bg-secondaire-600 w-full uppercase font-bold py-5 rounded-2xl">
          Inscription gratuite !
        </Button>
      </Link>
    </div>
  );
}
