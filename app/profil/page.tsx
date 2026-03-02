"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, MapPin, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilInfosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    zip: "",
    town: "",
    country: "France",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Erreur lors du chargement du profil");
        const data = await res.json();
        setEmail(data.email || "");
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          zip: data.address?.zip || "",
          town: data.address?.town || "",
          country: data.address?.country || "France",
        });
      } catch (err) {
        setError("Impossible de charger votre profil");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSuccess("Profil mis à jour avec succès");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader taille={45} />;
  }

  return (
    <>
      {error && (
        <div className="bg-s-50 border border-s-200 text-s-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-p-50 border border-p-200 text-p-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-p-600" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de base utilisées pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-n-50 text-n-500"
                />
                <p className="text-xs text-n-500">
                  L&apos;email ne peut pas être modifié
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-p-600" />
              Adresse
            </CardTitle>
            <CardDescription>
              Utilisée pour trouver les marchés proches de chez vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rue</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  placeholder="12 rue du Marché"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zip">Code postal</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zip: e.target.value,
                      }))
                    }
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="town">Ville</Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        town: e.target.value,
                      }))
                    }
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="bg-p-500 hover:bg-p-600 text-n-50"
        >
          {saving ? <Loader taille={45} /> : <Save className="h-4 w-4" />}
          Enregistrer les modifications
        </Button>
      </form>
    </>
  );
}
