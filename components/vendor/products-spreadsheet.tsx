"use client";

import IngredientImagePicker from "@/components/IngredientImagePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SpreadsheetRow {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  unit: string;
  basePrice: string;
  canSellByPiece: boolean;
  pricePerPiece: string;
  imagePreview: string | null;
  isOrganic: boolean;
  isLocal: boolean;
  errors: Record<string, string>;
  status: "idle" | "valid" | "error";
}

interface ProductsSpreadsheetProps {
  categories: Category[];
}

const UNIT_GROUPS = [
  {
    label: "Continu",
    units: [
      { value: "kg", label: "kg" },
      { value: "g", label: "g" },
      { value: "litre", label: "litre" },
    ],
  },
  {
    label: "Discret",
    units: [
      { value: "piece", label: "pièce" },
      { value: "botte", label: "botte" },
      { value: "lot", label: "lot" },
      { value: "barquette", label: "barquette" },
    ],
  },
];

const CONTINUOUS_UNITS = ["kg", "g", "litre"];

function createEmptyRow(): SpreadsheetRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    categoryId: "",
    unit: "",
    basePrice: "",
    canSellByPiece: false,
    pricePerPiece: "",
    imagePreview: null,
    isOrganic: false,
    isLocal: false,
    errors: {},
    status: "idle",
  };
}

function isRowEmpty(row: SpreadsheetRow): boolean {
  return !row.name && !row.categoryId && !row.unit && !row.basePrice;
}

function isRowFilled(row: SpreadsheetRow): boolean {
  return !!(row.name || row.categoryId || row.unit || row.basePrice);
}

export function ProductsSpreadsheet({ categories }: ProductsSpreadsheetProps) {
  const router = useRouter();
  const [rows, setRows] = useState<SpreadsheetRow[]>(() =>
    Array.from({ length: 5 }, createEmptyRow),
  );
  const [saving, setSaving] = useState(false);
  const [validated, setValidated] = useState(false);
  const [imagePickerRowId, setImagePickerRowId] = useState<string | null>(null);
  const lastRowNameRef = useRef<HTMLInputElement | null>(null);
  const prefetchCacheRef = useRef<Set<string>>(new Set());

  // Row actuellement ouverte dans le picker d'image
  const imagePickerRow = imagePickerRowId
    ? rows.find((r) => r.id === imagePickerRowId)
    : null;

  // Warning avant de quitter si des données ont été saisies
  const isDirty = rows.some(isRowFilled);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Mise à jour d'une cellule
  const updateCell = useCallback(
    (id: string, field: keyof SpreadsheetRow, value: string | boolean) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const { [field]: _, ...remainingErrors } = r.errors;
          return {
            ...r,
            [field]: value,
            status: "idle" as const,
            errors: remainingErrors,
          };
        }),
      );
      setValidated(false);
    },
    [],
  );

  // Mise à jour simple sans reset des erreurs (pour checkboxes)
  const updateCheckbox = useCallback(
    (id: string, field: "isOrganic" | "isLocal", value: boolean) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  // Ajouter une ligne
  const addRow = useCallback(() => {
    const newRow = createEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setValidated(false);
    setTimeout(() => {
      lastRowNameRef.current?.focus();
    }, 50);
  }, []);

  // Supprimer une ligne
  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length === 0 ? [createEmptyRow()] : filtered;
    });
    setValidated(false);
  }, []);

  // Sélection d'image via IngredientImagePicker (reçoit une URL)
  const handleImagePick = useCallback(
    (url: string) => {
      if (!imagePickerRowId) return;
      setRows((prev) =>
        prev.map((r) =>
          r.id === imagePickerRowId ? { ...r, imagePreview: url } : r,
        ),
      );
      setImagePickerRowId(null);
    },
    [imagePickerRowId],
  );

  const removeImage = useCallback((rowId: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, imagePreview: null } : r)),
    );
  }, []);

  // Toggle vente à la pièce
  const toggleCanSellByPiece = useCallback((id: string, value: boolean) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              canSellByPiece: value,
              pricePerPiece: value ? r.pricePerPiece : "",
            }
          : r,
      ),
    );
  }, []);

  // Pré-charger les images Unsplash en arrière-plan (traduit FR→EN puis fetch)
  const prefetchUnsplash = useCallback((name: string) => {
    if (!name || prefetchCacheRef.current.has(name.toLowerCase())) return;
    prefetchCacheRef.current.add(name.toLowerCase());

    (async () => {
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(name)}&langpair=fr|en`,
        );
        const data = await res.json();
        const englishName = data?.responseData?.translatedText?.trim() || name;
        // Pré-charge la recherche Unsplash (chauffe le cache navigateur + serveur)
        await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(englishName)}&page=1`,
        );
      } catch {
        // Silencieux — c'est du pré-chargement opportuniste
      }
    })();
  }, []);

  // Validation de toutes les lignes
  const validateAll = useCallback((): {
    valid: SpreadsheetRow[];
    errors: number;
  } => {
    const namesInBatch = new Map<string, number>();
    let errorCount = 0;

    const updatedRows = rows.map((row, index) => {
      if (isRowEmpty(row)) {
        return { ...row, status: "idle" as const, errors: {} };
      }

      const errors: Record<string, string> = {};

      // Nom
      const name = row.name.trim();
      if (!name) {
        errors.name = "Nom requis";
      } else if (name.length > 100) {
        errors.name = "Max 100 caractères";
      } else {
        const lowerName = name.toLowerCase();
        if (namesInBatch.has(lowerName)) {
          errors.name = `Doublon ligne ${(namesInBatch.get(lowerName) ?? 0) + 1}`;
        }
        namesInBatch.set(lowerName, index);
      }

      // Catégorie
      if (!row.categoryId) {
        errors.categoryId = "Catégorie requise";
      }

      // Unité
      if (!row.unit) {
        errors.unit = "Unité requise";
      }

      // Prix
      const price = parseFloat(row.basePrice);
      if (!row.basePrice || isNaN(price)) {
        errors.basePrice = "Prix requis";
      } else if (price <= 0) {
        errors.basePrice = "Prix > 0";
      } else if (price > 10000) {
        errors.basePrice = "Max 10 000 €";
      }

      // Prix par pièce (obligatoire si canSellByPiece est activé)
      if (row.canSellByPiece) {
        const piecePrice = parseFloat(row.pricePerPiece);
        if (!row.pricePerPiece || isNaN(piecePrice)) {
          errors.pricePerPiece = "Prix requis";
        } else if (piecePrice <= 0) {
          errors.pricePerPiece = "Prix > 0";
        } else if (piecePrice > 10000) {
          errors.pricePerPiece = "Max 10 000 €";
        }
      }

      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) errorCount++;

      return {
        ...row,
        errors,
        status: hasErrors ? ("error" as const) : ("valid" as const),
      };
    });

    setRows(updatedRows);
    setValidated(true);

    const validRows = updatedRows.filter((r) => r.status === "valid");
    return { valid: validRows, errors: errorCount };
  }, [rows]);

  // Soumission
  const handleSubmit = async () => {
    const { valid, errors } = validateAll();

    if (valid.length === 0) {
      toast.error(
        errors > 0
          ? "Corrigez les erreurs avant d'enregistrer"
          : "Remplissez au moins une ligne",
      );
      return;
    }

    if (errors > 0) {
      toast.error(
        `${errors} ligne(s) en erreur — seules les ${valid.length} ligne(s) valide(s) seront créées`,
      );
    }

    setSaving(true);

    try {
      const response = await fetch("/api/vendor/products/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: valid.map((r) => ({
            name: r.name.trim(),
            description: r.description.trim() || null,
            categoryId: r.categoryId,
            unit: r.unit,
            basePrice: parseFloat(r.basePrice),
            canSellByPiece: r.canSellByPiece,
            pricePerPiece: r.canSellByPiece
              ? parseFloat(r.pricePerPiece)
              : null,
            imageData: r.imagePreview,
            isOrganic: r.isOrganic,
            isLocal: r.isLocal,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const data = await response.json();
      toast.success(`${data.created} produit(s) créé(s)`);

      setTimeout(() => {
        router.push("/vendor/dashboard/etal");
      }, 1000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setSaving(false);
    }
  };

  // Gestion Enter sur la dernière ligne → ajouter une ligne
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number) => {
    if (e.key === "Enter" && rowIndex === rows.length - 1) {
      e.preventDefault();
      addRow();
    }
  };

  // Comptages
  const filledRows = rows.filter(isRowFilled);
  const validCount = validated
    ? rows.filter((r) => r.status === "valid").length
    : 0;
  const errorCount = validated
    ? rows.filter((r) => r.status === "error").length
    : 0;

  // Carte mobile pour une ligne
  const SpreadsheetCard = ({
    row,
    index,
  }: {
    row: SpreadsheetRow;
    index: number;
  }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 transition-colors overflow-hidden ${
        row.status === "error"
          ? "border-s-300 bg-s-50/30"
          : row.status === "valid"
            ? "border-p-300 bg-p-50/30"
            : "border-n-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-n-400">
          Ligne {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-n-400 hover:text-s-500"
          onClick={() => removeRow(row.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Nom */}
        <div>
          <label className="text-xs font-medium text-n-600 mb-1 block">
            Nom *
          </label>
          <input
            type="text"
            maxLength={100}
            value={row.name}
            onChange={(e) => updateCell(row.id, "name", e.target.value)}
            onBlur={(e) => {
              const trimmed = e.target.value.trim();
              updateCell(row.id, "name", trimmed);
              if (trimmed) prefetchUnsplash(trimmed);
            }}
            placeholder="Nom du produit"
            className={`w-full h-9 px-3 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
              row.errors.name
                ? "border-s-300 bg-s-50 focus:ring-s-500"
                : "border-n-200 focus:ring-p-500"
            }`}
          />
          {row.errors.name && (
            <p className="text-xs text-s-500 mt-0.5">{row.errors.name}</p>
          )}
        </div>

        {/* Image */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setImagePickerRowId(row.id)}
              className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                row.imagePreview
                  ? "border-p-300"
                  : "border-n-200 hover:border-p-300"
              }`}
            >
              {row.imagePreview ? (
                <img
                  src={row.imagePreview}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ImagePlus className="w-6 h-6 text-n-300" />
              )}
            </button>
            {row.imagePreview && (
              <button
                type="button"
                onClick={() => removeImage(row.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-s-500 text-white rounded-full flex items-center justify-center hover:bg-s-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-xs text-n-400">Photo (optionnel)</span>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-n-600 mb-1 block">
            Description
          </label>
          <input
            type="text"
            maxLength={200}
            value={row.description}
            onChange={(e) => updateCell(row.id, "description", e.target.value)}
            onBlur={(e) =>
              updateCell(row.id, "description", e.target.value.trim())
            }
            placeholder="Description, origine..."
            className="w-full h-9 px-3 text-sm border border-n-200 rounded-lg focus:ring-2 focus:outline-none focus:ring-p-500"
          />
        </div>

        {/* Catégorie + Unité */}
        <div className="grid grid-cols-2 gap-3 min-w-0">
          <div className="min-w-0">
            <label className="text-xs font-medium text-n-600 mb-1 block">
              Catégorie *
            </label>
            <select
              value={row.categoryId}
              onChange={(e) => updateCell(row.id, "categoryId", e.target.value)}
              className={`w-full min-w-0 h-9 px-2 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                row.errors.categoryId
                  ? "border-s-300 bg-s-50 focus:ring-s-500"
                  : "border-n-200 focus:ring-p-500"
              }`}
            >
              <option value="">Catégorie...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {row.errors.categoryId && (
              <p className="text-xs text-s-500 mt-0.5">
                {row.errors.categoryId}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label className="text-xs font-medium text-n-600 mb-1 block">
              Unité *
            </label>
            <select
              value={row.unit}
              onChange={(e) => updateCell(row.id, "unit", e.target.value)}
              className={`w-full min-w-0 h-9 px-2 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                row.errors.unit
                  ? "border-s-300 bg-s-50 focus:ring-s-500"
                  : "border-n-200 focus:ring-p-500"
              }`}
            >
              <option value="">Unité...</option>
              {UNIT_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.units.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {row.errors.unit && (
              <p className="text-xs text-s-500 mt-0.5">{row.errors.unit}</p>
            )}
          </div>
        </div>

        {/* Prix + Bio/Local */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-n-600 mb-1 block">
              Prix (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={row.basePrice}
              onChange={(e) => updateCell(row.id, "basePrice", e.target.value)}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  updateCell(row.id, "basePrice", val.toFixed(2));
                }
              }}
              placeholder="0.00"
              className={`w-full h-9 px-3 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                row.errors.basePrice
                  ? "border-s-300 bg-s-50 focus:ring-s-500"
                  : "border-n-200 focus:ring-p-500"
              }`}
            />
            {row.errors.basePrice && (
              <p className="text-xs text-s-500 mt-0.5">
                {row.errors.basePrice}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={row.isOrganic}
                onCheckedChange={(checked) =>
                  updateCheckbox(row.id, "isOrganic", !!checked)
                }
              />
              <Leaf className="w-3.5 h-3.5 text-p-600" />
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={row.isLocal}
                onCheckedChange={(checked) =>
                  updateCheckbox(row.id, "isLocal", !!checked)
                }
              />
              <MapPin className="w-3.5 h-3.5 text-t-600" />
            </label>
          </div>
        </div>

        {/* Vendable à la pièce (unités continues uniquement) */}
        {CONTINUOUS_UNITS.includes(row.unit) && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={row.canSellByPiece}
                onCheckedChange={(checked) =>
                  toggleCanSellByPiece(row.id, !!checked)
                }
              />
              <span className="text-xs font-medium text-n-600">
                Vendable à la pièce
              </span>
            </label>
            {row.canSellByPiece && (
              <div className="mt-2">
                <label className="text-xs font-medium text-n-600 mb-1 block">
                  Prix par pièce (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={row.pricePerPiece}
                  onChange={(e) =>
                    updateCell(row.id, "pricePerPiece", e.target.value)
                  }
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      updateCell(row.id, "pricePerPiece", val.toFixed(2));
                    }
                  }}
                  placeholder="Ex: 0.80 €/pièce"
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                    row.errors.pricePerPiece
                      ? "border-s-300 bg-s-50 focus:ring-s-500"
                      : "border-n-200 focus:ring-p-500"
                  }`}
                />
                {row.errors.pricePerPiece && (
                  <p className="text-xs text-s-500 mt-0.5">
                    {row.errors.pricePerPiece}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/vendor/dashboard/etal")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-p-800">Ajout rapide</h1>
            <p className="text-sm text-n-500">
              Ajoutez plusieurs produits en une fois. Les prix par marché se
              configurent ensuite.
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'actions sticky */}
      <div className="sticky top-2 ml-auto z-10 bg-white w-[80%] lg:w-full  rounded-xl p-3 sm:p-4 shadow-sm border border-n-100 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm text-n-600 whitespace-nowrap">
              {filledRows.length} ligne{filledRows.length > 1 ? "s" : ""}
            </span>
            {validated && (
              <>
                {validCount > 0 && (
                  <Badge className="bg-p-100 text-p-800">
                    {validCount} valide{validCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge className="bg-s-100 text-s-800">
                    {errorCount} erreur{errorCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/vendor/dashboard/etal")}
              disabled={saving}
              className="hidden sm:inline-flex"
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/vendor/dashboard/etal")}
              disabled={saving}
              className="sm:hidden h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving || filledRows.length === 0}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                Enregistrer{validCount > 0 ? ` ${validCount}` : ""} produit
                {validCount !== 1 ? "s" : ""}
              </span>
              <span className="sm:hidden">Enregistrer</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Vue mobile - Cartes */}
      <div className="lg:hidden space-y-3">
        {rows.map((row, index) => (
          <SpreadsheetCard key={row.id} row={row} index={index} />
        ))}

        <Button variant="outline" className="w-full" onClick={addRow}>
          <Plus className="w-4 h-4" />
          Ajouter une ligne
        </Button>
      </div>

      {/* Vue desktop - Tableau */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-n-100">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead className="bg-n-50 border-b border-n-100">
              <tr>
                <th className="px-2 py-3 text-center text-xs font-medium text-n-400 uppercase w-10">
                  #
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider min-w-50">
                  Nom *
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-n-500 uppercase tracking-wider w-14">
                  Photo
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider min-w-40">
                  Description
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider w-48">
                  Catégorie *
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider w-36">
                  Unité *
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider w-28">
                  Prix (€) *
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-n-500 uppercase tracking-wider w-36">
                  Prix/pièce
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-n-500 uppercase tracking-wider w-14">
                  <Leaf className="w-3.5 h-3.5 text-p-600 mx-auto" />
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-n-500 uppercase tracking-wider w-14">
                  <MapPin className="w-3.5 h-3.5 text-t-600 mx-auto" />
                </th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-50">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    row.status === "error"
                      ? "bg-s-50/50"
                      : row.status === "valid"
                        ? "bg-p-50/30"
                        : "hover:bg-n-50/50"
                  }`}
                >
                  {/* Numéro */}
                  <td className="px-2 py-1.5 text-center">
                    <span className="text-xs text-n-400">{index + 1}</span>
                  </td>

                  {/* Nom */}
                  <td className="px-2 py-1.5">
                    <div>
                      <input
                        ref={
                          index === rows.length - 1 ? lastRowNameRef : undefined
                        }
                        type="text"
                        maxLength={100}
                        value={row.name}
                        onChange={(e) =>
                          updateCell(row.id, "name", e.target.value)
                        }
                        onBlur={(e) => {
                          const trimmed = e.target.value.trim();
                          updateCell(row.id, "name", trimmed);
                          if (trimmed) prefetchUnsplash(trimmed);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="Nom du produit"
                        className={`w-full h-8 px-2 text-sm border rounded focus:ring-2 focus:outline-none ${
                          row.errors.name
                            ? "border-s-300 bg-s-50 focus:ring-s-500"
                            : "border-n-200 focus:ring-p-500 focus:border-p-500"
                        }`}
                      />
                      {row.errors.name && (
                        <p className="text-[11px] text-s-500 mt-0.5 leading-tight">
                          {row.errors.name}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Image */}
                  <td className="px-2 py-1.5 text-center">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setImagePickerRowId(row.id)}
                        className={`w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                          row.imagePreview
                            ? "border-p-300"
                            : "border-n-200 hover:border-p-300 hover:bg-p-50/50"
                        }`}
                        tabIndex={-1}
                      >
                        {row.imagePreview ? (
                          <img
                            src={row.imagePreview}
                            alt=""
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ImagePlus className="w-4 h-4 text-n-400" />
                        )}
                      </button>
                      {row.imagePreview && (
                        <button
                          type="button"
                          onClick={() => removeImage(row.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-s-500 text-white rounded-full flex items-center justify-center hover:bg-s-600"
                          tabIndex={-1}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      maxLength={200}
                      value={row.description}
                      onChange={(e) =>
                        updateCell(row.id, "description", e.target.value)
                      }
                      onBlur={(e) =>
                        updateCell(row.id, "description", e.target.value.trim())
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Description, origine..."
                      className="w-full h-8 px-2 text-sm border border-n-200 rounded focus:ring-2 focus:outline-none focus:ring-p-500 focus:border-p-500"
                    />
                  </td>

                  {/* Catégorie */}
                  <td className="px-2 py-1.5">
                    <div>
                      <select
                        value={row.categoryId}
                        onChange={(e) =>
                          updateCell(row.id, "categoryId", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-full h-8 px-1.5 text-sm border rounded focus:ring-2 focus:outline-none ${
                          row.errors.categoryId
                            ? "border-s-300 bg-s-50 focus:ring-s-500"
                            : "border-n-200 focus:ring-p-500 focus:border-p-500"
                        }`}
                      >
                        <option value="">Catégorie...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {row.errors.categoryId && (
                        <p className="text-[11px] text-s-500 mt-0.5 leading-tight">
                          {row.errors.categoryId}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Unité */}
                  <td className="px-2 py-1.5">
                    <div>
                      <select
                        value={row.unit}
                        onChange={(e) =>
                          updateCell(row.id, "unit", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-full h-8 px-1.5 text-sm border rounded focus:ring-2 focus:outline-none ${
                          row.errors.unit
                            ? "border-s-300 bg-s-50 focus:ring-s-500"
                            : "border-n-200 focus:ring-p-500 focus:border-p-500"
                        }`}
                      >
                        <option value="">Unité...</option>
                        {UNIT_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.units.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {row.errors.unit && (
                        <p className="text-[11px] text-s-500 mt-0.5 leading-tight">
                          {row.errors.unit}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Prix */}
                  <td className="px-2 py-1.5">
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={row.basePrice}
                        onChange={(e) =>
                          updateCell(row.id, "basePrice", e.target.value)
                        }
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            updateCell(row.id, "basePrice", val.toFixed(2));
                          }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="0.00"
                        className={`w-full h-8 px-2 text-sm border rounded focus:ring-2 focus:outline-none ${
                          row.errors.basePrice
                            ? "border-s-300 bg-s-50 focus:ring-s-500"
                            : "border-n-200 focus:ring-p-500 focus:border-p-500"
                        }`}
                      />
                      {row.errors.basePrice && (
                        <p className="text-[11px] text-s-500 mt-0.5 leading-tight">
                          {row.errors.basePrice}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Prix par pièce */}
                  <td className="px-2 py-1.5">
                    {CONTINUOUS_UNITS.includes(row.unit) ? (
                      row.canSellByPiece ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={row.pricePerPiece}
                              onChange={(e) =>
                                updateCell(
                                  row.id,
                                  "pricePerPiece",
                                  e.target.value,
                                )
                              }
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  updateCell(
                                    row.id,
                                    "pricePerPiece",
                                    val.toFixed(2),
                                  );
                                }
                              }}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              placeholder="€/pièce"
                              className={`w-full h-7 px-2 text-sm border rounded focus:ring-2 focus:outline-none ${
                                row.errors.pricePerPiece
                                  ? "border-s-300 bg-s-50 focus:ring-s-500"
                                  : "border-n-200 focus:ring-p-500 focus:border-p-500"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                toggleCanSellByPiece(row.id, false)
                              }
                              className="shrink-0 text-n-400 hover:text-s-500 transition-colors"
                              tabIndex={-1}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {row.errors.pricePerPiece && (
                            <p className="text-[11px] text-s-500 mt-0.5 leading-tight">
                              {row.errors.pricePerPiece}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCanSellByPiece(row.id, true)}
                          className="inline-flex items-center rounded-full border border-p-200 bg-p-100 px-2.5 py-0.5 text-[11px] text-p-700 cursor-pointer hover:bg-p-200 hover:shadow-sm hover:shadow-p-200/50 active:scale-95 transition-all"
                          tabIndex={-1}
                        >
                          Se vend à la pièce ?
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-n-300 px-2">—</span>
                    )}
                  </td>

                  {/* Bio */}
                  <td className="px-2 py-1.5 text-center">
                    <Checkbox
                      checked={row.isOrganic}
                      onCheckedChange={(checked) =>
                        updateCheckbox(row.id, "isOrganic", !!checked)
                      }
                    />
                  </td>

                  {/* Local */}
                  <td className="px-2 py-1.5 text-center">
                    <Checkbox
                      checked={row.isLocal}
                      onCheckedChange={(checked) =>
                        updateCheckbox(row.id, "isLocal", !!checked)
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-n-400 hover:text-s-500"
                      onClick={() => removeRow(row.id)}
                      tabIndex={-1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bouton ajouter une ligne */}
        <div className="border-t border-n-100 px-4 py-2">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-p-600 hover:text-p-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une ligne
          </button>
        </div>
      </div>

      {/* Dialog Image Picker */}
      <Dialog
        open={!!imagePickerRowId}
        onOpenChange={(open) => {
          if (!open) setImagePickerRowId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Choisir une photo
              {imagePickerRow?.name && (
                <span className="font-normal text-n-500">
                  {" "}
                  — {imagePickerRow.name}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Recherchez sur Unsplash ou importez votre propre image.
            </DialogDescription>
          </DialogHeader>
          {imagePickerRowId && (
            <IngredientImagePicker
              defaultQuery={imagePickerRow?.name || ""}
              onImageSelect={handleImagePick}
              disableHoverPreview
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
