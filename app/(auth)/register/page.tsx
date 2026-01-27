"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Store,
  User,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type UserRole = "CLIENT" | "VENDOR";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  // Address
  street: string;
  zip: string;
  town: string;
  // Vendor specific
  stallName: string;
  siret: string;
  companyName: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "vendor" ? "VENDOR" : null;

  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siretLoading, setSiretLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    zip: "",
    town: "",
    stallName: "",
    siret: "",
    companyName: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Recherche SIRET via API gouvernement
  const searchSiret = async () => {
    if (formData.siret.length < 9) {
      setError("Le SIRET doit contenir au moins 9 chiffres");
      return;
    }

    setSiretLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${formData.siret}&page=1&per_page=1`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const company = data.results[0];
        const siege = company.siege;

        // Vérifier si l'entreprise est active
        if (company.etat_administratif !== "A") {
          setError("Cette entreprise n'est plus active");
          return;
        }

        updateField("companyName", company.nom_complet || "");
        updateField("street", siege?.adresse || "");
        updateField("zip", siege?.code_postal || "");
        updateField("town", siege?.libelle_commune || "");
      } else {
        setError("Aucune entreprise trouvée avec ce SIRET");
      }
    } catch {
      setError("Erreur lors de la recherche SIRET");
    } finally {
      setSiretLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (role === "VENDOR" && (!formData.stallName || !formData.siret)) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Connexion automatique après inscription
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Inscription réussie mais connexion échouée
        router.push("/login");
      } else {
        router.push(role === "VENDOR" ? "/vendor/dashboard/profil" : "/");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-CardSection">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <span className="text-7xl font-bold font-special text-principale-700 ">
              MyCabas
            </span>
          </Link>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            {step === 1
              ? "Choisissez votre type de compte"
              : role === "VENDOR"
                ? "Inscription producteur"
                : "Inscription client"}
          </CardDescription>

          {/* Progress indicator */}
          <div className="mt-4 flex justify-center gap-2">
            <div
              className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}
            />
          </div>
        </CardHeader>

        {/* Step 1: Choose role */}
        {step === 1 && (
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setRole("CLIENT");
                setStep(2);
              }}
              className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Je suis un client</h3>
                <p className="text-sm text-muted-foreground">
                  Je cherche des produits frais sur les marchés
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("VENDOR");
                setStep(2);
              }}
              className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Je suis un producteur</h3>
                <p className="text-sm text-muted-foreground">
                  Je vends mes produits sur les marchés
                </p>
              </div>
            </button>
          </CardContent>
        )}

        {/* Step 2: Registration form */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Vendor-specific fields */}
              {role === "VENDOR" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="siret"
                        placeholder="123 456 789 00012"
                        value={formData.siret}
                        onChange={(e) => updateField("siret", e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="default"
                        onClick={searchSiret}
                        disabled={siretLoading || loading}
                      >
                        {siretLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Vérifier"
                        )}
                      </Button>
                    </div>
                  </div>

                  {formData.companyName && (
                    <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      {formData.companyName}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="stallName">Nom du stand *</Label>
                    <Input
                      id="stallName"
                      placeholder="Ma Ferme Bio"
                      value={formData.stallName}
                      onChange={(e) => updateField("stallName", e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address fields */}
              <div className="space-y-2">
                <Label htmlFor="street">Adresse</Label>
                <Input
                  id="street"
                  placeholder="123 rue de la République"
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Code postal</Label>
                  <Input
                    id="zip"
                    placeholder="01000"
                    value={formData.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="town">Ville</Label>
                  <Input
                    id="town"
                    placeholder="Bourg-en-Bresse"
                    value={formData.town}
                    onChange={(e) => updateField("town", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setRole(null);
                    setError("");
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {/* Footer for step 1 */}
        {step === 1 && (
          <CardFooter>
            <p className="w-full text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
