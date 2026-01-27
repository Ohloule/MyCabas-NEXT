"use client";

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
import {
  AlertCircle,
  Building2,
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface VendorProfile {
  id: string;
  stallName: string;
  companyName: string;
  siret: string;
  street?: string;
  zip?: string;
  town?: string;
}

interface BankInfo {
  hasInfo: boolean;
  maskedIban: string;
  maskedBic: string;
  bankHolder: string;
  updatedAt: string | null;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États du formulaire RIB
  const [showBankForm, setShowBankForm] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    iban: "",
    bic: "",
    bankHolder: "",
  });

  // Charger le profil et les infos bancaires
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Profil
        const profileRes = await fetch("/api/vendor/profile");
        if (!profileRes.ok) throw new Error("Erreur profil");
        const profileData = await profileRes.json();

        // Adresse
        const addressRes = await fetch("/api/vendor/addresses");
        if (!addressRes.ok) throw new Error("Erreur adresse");
        const addressData = await addressRes.json();

        setProfile({ ...profileData, ...addressData });

        // Infos bancaires
        const bankRes = await fetch("/api/vendor/bank-info");
        if (bankRes.ok) {
          const bankData = await bankRes.json();
          setBankInfo(bankData);
          if (bankData.bankHolder) {
            setBankFormData((prev) => ({
              ...prev,
              bankHolder: bankData.bankHolder,
            }));
          }
        }
      } catch (err) {
        setError("Impossible de charger votre profil");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formater l'IBAN en groupes de 4
  const formatIbanInput = (value: string) => {
    const clean = value.replace(/\s/g, "").toUpperCase();
    return clean.match(/.{1,4}/g)?.join(" ") || clean;
  };

  // Sauvegarder les infos bancaires
  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vendor/bank-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iban: bankFormData.iban.replace(/\s/g, ""),
          bic: bankFormData.bic,
          bankHolder: bankFormData.bankHolder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setBankInfo({
        hasInfo: true,
        maskedIban: data.maskedIban,
        maskedBic: data.maskedBic,
        bankHolder: data.bankHolder,
        updatedAt: new Date().toISOString(),
      });

      setShowBankForm(false);
      setBankFormData({ iban: "", bic: "", bankHolder: data.bankHolder });
      setSuccess("Informations bancaires enregistrées avec succès");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  // Supprimer les infos bancaires
  const handleDeleteBankInfo = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer vos informations bancaires ?",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/vendor/bank-info", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setBankInfo({
        hasInfo: false,
        maskedIban: "",
        maskedBic: "",
        bankHolder: "",
        updatedAt: null,
      });
      setBankFormData({ iban: "", bic: "", bankHolder: "" });
      setSuccess("Informations bancaires supprimées");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-principale-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <User className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-principale-800">
            Mon profil
          </h1>
          <p className="text-gray-600">
            Informations légales et coordonnées bancaires
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Informations légales (lecture seule) */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Informations légales
            </CardTitle>
            <CardDescription>
              Ces informations ne peuvent pas être modifiées ici. Contactez le
              support si nécessaire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-gray-500 text-sm">Raison sociale</Label>
                <p className="font-medium">{profile?.companyName}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">SIRET</Label>
                <p className="font-medium font-mono">{profile?.siret}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-500 text-sm">
                  Adresse du siège
                </Label>
                <p className="font-medium">
                  {(() => {
                    const street = profile?.street || "";
                    const zip = profile?.zip || "";
                    const town = profile?.town || "";

                    // On prépare les morceaux
                    let result = street;

                    // On ajoute le code postal s'il n'est pas déjà dans la rue
                    if (zip && !street.includes(zip)) {
                      result += (result ? ", " : "") + zip;
                    }

                    // On ajoute la ville si elle n'est pas déjà dans le résultat
                    if (
                      town &&
                      !result.toLowerCase().includes(town.toLowerCase())
                    ) {
                      result += (result.includes(zip) ? " " : ", ") + town;
                    }

                    return result || "Non renseignée";
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations bancaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Coordonnées bancaires (RIB)
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>Vos données sont chiffrées et sécurisées</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showBankForm ? (
              <>
                {bankInfo?.hasInfo ? (
                  <div className="space-y-4">
                    {/* Affichage des infos masquées */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-500 text-sm">IBAN</Label>
                          <p className="font-mono font-medium flex items-center gap-2">
                            {showIban ? (
                              <span className="text-gray-400">
                                Données chiffrées
                              </span>
                            ) : (
                              bankInfo.maskedIban
                            )}
                            <button
                              type="button"
                              onClick={() => setShowIban(!showIban)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showIban ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </p>
                        </div>
                        <Lock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          BIC / SWIFT
                        </Label>
                        <p className="font-mono font-medium">
                          {bankInfo.maskedBic}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          Titulaire du compte
                        </Label>
                        <p className="font-medium">{bankInfo.bankHolder}</p>
                      </div>
                      {bankInfo.updatedAt && (
                        <p className="text-xs text-gray-500">
                          Dernière mise à jour :{" "}
                          {new Date(bankInfo.updatedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBankForm(true)}
                        className="flex-1"
                      >
                        Modifier les informations
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleDeleteBankInfo}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Aucune coordonnée bancaire enregistrée
                    </p>
                    <Button onClick={() => setShowBankForm(true)}>
                      Ajouter mon RIB
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSaveBankInfo} className="space-y-4">
                {/* Titulaire */}
                <div className="space-y-2">
                  <Label htmlFor="bankHolder">
                    Titulaire du compte <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bankHolder"
                    name="bankHolder"
                    value={bankFormData.bankHolder}
                    onChange={(e) =>
                      setBankFormData((prev) => ({
                        ...prev,
                        bankHolder: e.target.value,
                      }))
                    }
                    placeholder="Nom du titulaire"
                    required
                  />
                </div>

                {/* IBAN */}
                <div className="space-y-2">
                  <Label htmlFor="iban">
                    IBAN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="iban"
                    name="iban"
                    value={bankFormData.iban}
                    onChange={(e) => {
                      const formatted = formatIbanInput(e.target.value);
                      setBankFormData((prev) => ({ ...prev, iban: formatted }));
                    }}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    className="font-mono"
                    maxLength={42}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    27 caractères pour un IBAN français (sans espaces)
                  </p>
                </div>

                {/* BIC */}
                <div className="space-y-2">
                  <Label htmlFor="bic">
                    BIC / SWIFT <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bic"
                    name="bic"
                    value={bankFormData.bic}
                    onChange={(e) => {
                      setBankFormData((prev) => ({
                        ...prev,
                        bic: e.target.value.toUpperCase(),
                      }));
                    }}
                    placeholder="BNPAFRPP"
                    className="font-mono uppercase"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-gray-500">8 ou 11 caractères</p>
                </div>

                {/* Info sécurité */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Vos informations bancaires sont chiffrées avec
                    l&apos;algorithme AES-256-GCM avant d&apos;être stockées.
                    Elles ne sont jamais transmises en clair.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBankForm(false);
                      setBankFormData({
                        iban: "",
                        bic: "",
                        bankHolder: bankInfo?.bankHolder || "",
                      });
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
