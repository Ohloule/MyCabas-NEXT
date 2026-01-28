"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorCard } from "@/components/vendor/VendorCard";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  Globe,
  Instagram,
  Loader2,
  Mail,
  Phone,
  Save,
  Settings,
  Store,
  Tag,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface VendorSettings {
  id: string;
  stallName: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  } | null;
  paymentMethods: string[];
  labels: string[];
  logoUrl: string | null;
}

const PAYMENT_METHODS = [
  { id: "CASH", label: "Espèces", icon: "💵" },
  { id: "CARD", label: "Carte bancaire", icon: "💳" },
  { id: "CHECK", label: "Chèque", icon: "📝" },
  { id: "TRANSFER", label: "Virement", icon: "🏦" },
];

const VENDOR_LABELS = [
  { id: "HOME_MADE", label: "Fait maison", icon: "🏠" },
  { id: "BIO", label: "Agriculture biologique", icon: "🌱" },
  { id: "LOCAL", label: "Producteur local", icon: "📍" },
  { id: "ARTISAN", label: "Artisan", icon: "🔨" },
  { id: "FERMIER", label: "Producteur fermier", icon: "🚜" },
  { id: "AOC_AOP", label: "Appellation d'origine (AOC/AOP)", icon: "🏅" },
  { id: "LABEL_ROUGE", label: "Label Rouge", icon: "🔴" },
  { id: "FAIR_TRADE", label: "Commerce équitable", icon: "🤝" },
  { id: "NO_ICE", label: "Aucun produit surgelé", icon: "❄️" },
];

export default function ParametresPage() {
  const [settings, setSettings] = useState<VendorSettings | null>(null);
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
    instagram: "",
    facebook: "",
    tiktok: "",
    paymentMethods: [] as string[],
    labels: [] as string[],
  });

  // Charger les paramètres
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/vendor/profile");
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();

        setSettings(data);
        setFormData({
          stallName: data.stallName || "",
          description: data.description || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          instagram: data.socialLinks?.instagram || "",
          facebook: data.socialLinks?.facebook || "",
          tiktok: data.socialLinks?.tiktok || "",
          paymentMethods: data.paymentMethods || [],
          labels: data.labels || [],
        });
      } catch (err) {
        setError("Impossible de charger vos paramètres");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Gérer les changements de texte
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stallName: formData.stallName,
          description: formData.description || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          socialLinks: {
            instagram: formData.instagram || undefined,
            facebook: formData.facebook || undefined,
            tiktok: formData.tiktok || undefined,
          },
          paymentMethods: formData.paymentMethods,
          labels: formData.labels,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSuccess("Paramètres enregistrés avec succès");
      setTimeout(() => setSuccess(null), 3000);
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
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Settings className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-principale-800">
            Vitrine de la boutique
          </h1>
          <p className="text-gray-600">
            Personnalisez votre vitrine et vos informations visible par le public
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

      <form onSubmit={handleSubmit} className="space-y-6 ">
        {/* Informations de la boutique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5" />
              Informations de la boutique
            </CardTitle>
            <CardDescription>
              Ces informations seront visibles sur votre vitrine publique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stallName">
                Nom de la boutique <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stallName"
                name="stallName"
                value={formData.stallName}
                onChange={handleChange}
                placeholder="Ma Belle Ferme"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Présentez votre activité, vos produits, votre histoire..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/500 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Contact professionnel
            </CardTitle>
            <CardDescription>
              Coordonnées visibles par vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
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
                    placeholder="contact@mabelleferme.fr"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Site web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.mabelleferme.fr"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ExternalLink className="h-5 w-5" />
              Réseaux sociaux
            </CardTitle>
            <CardDescription>
              Partagez vos réseaux pour fidéliser vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@mabelleferme"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="mabelleferme"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  <Input
                    id="tiktok"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleChange}
                    placeholder="@mabelleferme"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moyens de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" />
              Moyens de paiement acceptés
            </CardTitle>
            <CardDescription>
              Indiquez comment vos clients peuvent vous payer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.paymentMethods.includes(method.id)
                      ? "border-principale-500 bg-principale-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={formData.paymentMethods.includes(method.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethods: [...prev.paymentMethods, method.id],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethods: prev.paymentMethods.filter(
                            (m) => m !== method.id,
                          ),
                        }));
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span>{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Labels et certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5" />
              Labels et certifications
            </CardTitle>
            <CardDescription>
              Mettez en avant vos engagements et certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VENDOR_LABELS.map((label) => (
                <label
                  key={label.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.labels.includes(label.id)
                      ? "border-principale-500 bg-principale-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={formData.labels.includes(label.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [...prev.labels, label.id],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== label.id),
                        }));
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span>{label.icon}</span>
                    <span className="text-sm font-medium">{label.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Aperçu de votre boutique
            </CardTitle>
            <CardDescription>
              Voici comment vos clients verront votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto">
              <VendorCard
                vendor={{
                  stallName: formData.stallName || "Nom de votre boutique",
                  description: formData.description || null,
                  phone: formData.phone || null,
                  email: formData.email || null,
                  logoUrl: settings?.logoUrl || null,
                  website: formData.website || null,
                  socialLinks: {
                    instagram: formData.instagram || undefined,
                    facebook: formData.facebook || undefined,
                    tiktok: formData.tiktok || undefined,
                  },
                  paymentMethods: formData.paymentMethods,
                  labels: formData.labels,
                }}
                isPreview={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
