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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorCard } from "@/components/vendor/VendorCard";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  ExternalLink,
  Eye,
  Globe,
  ImageIcon,
  Instagram,
  Mail,
  Phone,
  Save,
  Settings,
  Store,
  Tag,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Redimensionner et compresser l'image côté client
  const compressImage = (file: File, maxDim = 1200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Échec de la compression"));
          },
          "image/webp",
          0.85,
        );
      };
      img.onerror = () => reject(new Error("Impossible de lire l'image"));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de logo
  const handleLogoUpload = useCallback(async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier dépasse la taille maximale de 5 Mo.");
      return;
    }

    setUploading(true);
    setError(null);

    // Aperçu local immédiat
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      // Redimensionner (max 1200px) et convertir en WebP
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed, `logo_${Date.now()}.webp`);

      const response = await fetch("/api/vendor/upload-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      const data = await response.json();
      setSettings((prev) => (prev ? { ...prev, logoUrl: data.logoUrl } : prev));
      setLogoPreview(null);
      setSuccess("Photo mise à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setLogoPreview(null);
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDeleteLogo = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/vendor/upload-logo", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setSettings((prev) => (prev ? { ...prev, logoUrl: null } : prev));
      setLogoPreview(null);
      setSuccess("Photo supprimée");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleLogoUpload(file);
    },
    [handleLogoUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleLogoUpload(file);
      // Reset pour pouvoir re-sélectionner le même fichier
      e.target.value = "";
    },
    [handleLogoUpload],
  );

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
        <Loader taille={45} />
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
            Personnalisez votre vitrine et vos informations visible par le
            public
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-secondaire-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
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

      {/* Layout deux colonnes : formulaire + aperçu sticky */}
      <div className="lg:flex lg:gap-6">
        {/* Colonne gauche : formulaire */}
        <div className="lg:flex-1 min-w-0">

      {/* Photo de la boutique (en dehors du form car upload indépendant) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Photo de la boutique
          </CardTitle>
          <CardDescription>
            Cette image sera affichée en bannière sur votre vitrine (JPG, PNG ou
            WebP, 5 Mo max)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Aperçu actuel */}
            <div className="shrink-0">
              <div className="w-40 h-28 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                {logoPreview || settings?.logoUrl ? (
                  <Image
                    src={logoPreview || settings!.logoUrl!}
                    alt="Logo de la boutique"
                    width={160}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mb-1" />
                    <span className="text-xs">Aucune photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Zone de drop / upload */}
            <div className="flex-1 w-full">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-principale-500 bg-principale-50"
                    : "border-gray-300 hover:border-principale-400 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader taille={45} />
                    <span className="text-sm text-gray-600">
                      Upload en cours...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-principale-600">
                        Cliquez ou glissez
                      </span>
                      <span className="text-sm text-gray-500">
                        {" "}
                        une image ici
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      JPG, PNG ou WebP - 5 Mo max
                    </span>
                  </div>
                )}
              </div>

              {/* Bouton supprimer */}
              {settings?.logoUrl && !uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-secondaire-50"
                  onClick={handleDeleteLogo}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer la photo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form id="vitrine-form" onSubmit={handleSubmit} className="space-y-6 ">
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

        {/* Bouton de sauvegarde (mobile uniquement) */}
        <div className="flex justify-end lg:hidden">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader taille={45} /> : <Save className="h-4 w-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
        </div>

        {/* Colonne droite : aperçu sticky (desktop uniquement) */}
        <div className="hidden lg:block lg:w-95 shrink-0">
          <div className="sticky top-6">
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
              </CardContent>
            </Card>
            <Button
              type="submit"
              form="vitrine-form"
              disabled={saving}
              size="lg"
              className="w-full mt-4"
            >
              {saving ? <Loader taille={45} /> : <Save className="h-4 w-4" />}
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
