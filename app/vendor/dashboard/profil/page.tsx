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
import { Textarea } from "@/components/ui/textarea";
import { VendorCard, VendorCardData } from "@/components/vendor/VendorCard";
import {
  AlertCircle,
  Award,
  CheckCircle,
  CreditCard,
  Eye,
  Facebook,
  Globe,
  Instagram,
  Loader2,
  Mail,
  Phone,
  Save,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface VendorProfile {
  id: string;
  stallName: string;
  companyName: string;
  siret: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  website: string | null;
  socialLinks: SocialLinks | null;
  paymentMethods: string[];
  labels: string[];
  street?: string;
  zip?: string;
  town?: string;
}

// Options pour les modes de paiement
const PAYMENT_METHODS = [
  { value: "CASH", label: "Espèces", icon: "💵" },
  { value: "CARD", label: "Carte bancaire", icon: "💳" },
  { value: "CHECK", label: "Chèque", icon: "📝" },
  { value: "TRANSFER", label: "Virement", icon: "🏦" },
];

// Options pour les labels/certifications
const VENDOR_LABELS = [
  { value: "HOME_MADE", label: "Fait maison", icon: "🏠" },
  { value: "BIO", label: "Agriculture biologique", icon: "🌱" },
  { value: "LOCAL", label: "Producteur local", icon: "📍" },
  { value: "ARTISAN", label: "Artisan", icon: "🔨" },
  { value: "FERMIER", label: "Producteur fermier", icon: "🚜" },
  { value: "AOC_AOP", label: "Appellation d'origine (AOC/AOP)", icon: "🏅" },
  { value: "LABEL_ROUGE", label: "Label Rouge", icon: "🔴" },
  { value: "FAIR_TRADE", label: "Commerce équitable", icon: "🤝" },
  { value: "NO_ICE", label: "Aucun produit surgelé", icon: "❄️" },
];

export default function ProfilPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState({
    stallName: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    paymentMethods: [] as string[],
    labels: [] as string[],
  });

  // Charger le profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/vendor/profile");
        if (!response.ok) throw new Error("Erreur profil");
        const profileData = await response.json();

        // 2. Récupérer l'adresse
        const responseAddress = await fetch("/api/vendor/addresses");
        if (!responseAddress.ok) throw new Error("Erreur adresse");
        const addressData = await responseAddress.json();

        // 3. Fusionner les deux dans une seule variable "data"
        const data = {
          ...profileData,
          ...addressData, // Ceci ajoute street, zip, town à l'objet
        };

        console.log(data);

        setProfile(data);

        // Remplir le formulaire
        const socialLinks = data.socialLinks || {};
        setFormData({
          stallName: data.stallName || "",
          description: data.description || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          logoUrl: data.logoUrl || "",
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          tiktok: socialLinks.tiktok || "",
          paymentMethods: data.paymentMethods || [],
          labels: data.labels || [],
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

  // Gérer les changements de champs texte
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  // Toggle un mode de paiement
  const togglePaymentMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  // Toggle un label
  const toggleLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  // Sauvegarder le profil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Construire les social links
      const socialLinks: SocialLinks = {};
      if (formData.instagram) socialLinks.instagram = formData.instagram;
      if (formData.facebook) socialLinks.facebook = formData.facebook;
      if (formData.tiktok) socialLinks.tiktok = formData.tiktok;

      const response = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stallName: formData.stallName,
          description: formData.description || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          logoUrl: formData.logoUrl || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          paymentMethods: formData.paymentMethods,
          labels: formData.labels,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSuccess("Profil mis à jour avec succès !");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
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
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Store className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-principale-800">
            Profil de ma boutique
          </h1>
          <p className="text-gray-600">
            Informations visibles par vos clients sur les marchés
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Informations légales (lecture seule) */}
      <Card className="mb-6 bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Informations légales</CardTitle>
          <CardDescription>
            Ces informations ne peuvent pas être modifiées ici
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-gray-500">Raison sociale</Label>
              <p className="font-medium">{profile?.companyName}</p>
            </div>
            <div>
              <Label className="text-gray-500">SIRET</Label>
              <p className="font-medium">{profile?.siret}</p>
            </div>
            <div>
              <Label className="text-gray-500">Adresse</Label>
              <p className="font-medium">
                {profile?.street} {profile?.zip} {profile?.town}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de la boutique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Ma boutique
            </CardTitle>
            <CardDescription>
              Les informations principales de votre stand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nom de la boutique */}
              <div className="space-y-2">
                <Label htmlFor="stallName">
                  Nom de la boutique <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stallName"
                  name="stallName"
                  value={formData.stallName}
                  onChange={handleChange}
                  placeholder="Ex: La Ferme du Soleil"
                  required
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo / Image de la boutique</Label>
                <div className="flex gap-2">
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="URL de l'image"
                    className="flex-1"
                  />
                  {formData.logoUrl && (
                    <div className="h-9 w-9 rounded-lg border overflow-hidden shrink-0">
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Entrez l'URL d'une image hébergée en ligne
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre activité, vos produits, votre histoire..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Cette description sera visible par les clients
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées de contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Coordonnées de contact
            </CardTitle>
            <CardDescription>
              Comment vos clients peuvent vous joindre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone professionnel</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06 12 34 56 78"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email de contact</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@maboutique.fr"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Site web */}
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.maboutique.fr"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Réseaux sociaux
            </CardTitle>
            <CardDescription>
              Vos profils sur les réseaux sociaux (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@maboutique"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="maboutique"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🎵
                  </span>
                  <Input
                    id="tiktok"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleChange}
                    placeholder="@maboutique"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modes de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Modes de paiement acceptés
            </CardTitle>
            <CardDescription>
              Sélectionnez les moyens de paiement que vous acceptez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = formData.paymentMethods.includes(
                  method.value,
                );
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => togglePaymentMethod(method.value)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-principale-500 bg-principale-50 text-principale-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }
                    `}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium text-sm">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Labels et certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Labels et certifications
            </CardTitle>
            <CardDescription>
              Mettez en avant vos certifications et engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VENDOR_LABELS.map((label) => {
                const isSelected = formData.labels.includes(label.value);
                return (
                  <button
                    key={label.value}
                    type="button"
                    onClick={() => toggleLabel(label.value)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? "border-principale-500 bg-principale-50 text-principale-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }
                    `}
                  >
                    <span className="text-2xl">{label.icon}</span>
                    <span className="font-medium text-sm">{label.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu en temps réel */}
        <Card className="border-2 border-dashed border-principale-200 bg-principale-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu de votre fiche
            </CardTitle>
            <CardDescription>
              Voici comment votre boutique apparaîtra aux clients sur les
              marchés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto">
              <VendorCard
                vendor={
                  {
                    stallName: formData.stallName || "Nom de votre boutique",
                    description: formData.description || null,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    logoUrl: formData.logoUrl || null,
                    website: formData.website || null,
                    socialLinks:
                      formData.instagram || formData.facebook || formData.tiktok
                        ? {
                            instagram: formData.instagram || undefined,
                            facebook: formData.facebook || undefined,
                            tiktok: formData.tiktok || undefined,
                          }
                        : null,
                    paymentMethods: formData.paymentMethods,
                    labels: formData.labels,
                  } as VendorCardData
                }
                isPreview={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
