"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";

interface ParsedRow {
  rowNumber: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  isOrganic: boolean;
  isLocal: boolean;
  errors: string[];
  isValid: boolean;
}

interface PreviewResult {
  rows: ParsedRow[];
  validCount: number;
  errorCount: number;
}

interface ImportProductsDialogProps {
  onImportSuccess: () => void;
  children: React.ReactNode;
}

export function ImportProductsDialog({
  onImportSuccess,
  children,
}: ImportProductsDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setSuccess(null);
    setPreview(null);

    // Vérifier le type
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setError("Le fichier doit être au format Excel (.xlsx ou .xls)");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "preview");

      const response = await fetch("/api/vendor/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse du fichier");
      }

      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview || preview.validCount === 0) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "import");

      const response = await fetch("/api/vendor/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'import");
      }

      setSuccess(data.message);
      onImportSuccess();

      // Fermer après 2 secondes
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/vendor/products/template";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-principale-600" />
            Importer des produits
          </DialogTitle>
          <DialogDescription>
            Importez plusieurs produits à la fois depuis un fichier Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Étape 1: Télécharger le template */}
          {!file && !preview && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Étape 1 : Téléchargez le template
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Utilisez notre fichier Excel pré-formaté pour remplir vos produits facilement.
                </p>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" />
                  Télécharger le template
                </Button>
              </div>

              {/* Zone de drop */}
              <div className="relative">
                <h4 className="font-medium text-gray-900 mb-2">
                  Étape 2 : Importez votre fichier
                </h4>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-principale-500 bg-principale-50"
                      : "border-gray-300 hover:border-principale-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez votre fichier Excel ici
                  </p>
                  <p className="text-sm text-gray-500 mb-3">ou</p>
                  <label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        Parcourir les fichiers
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Chargement */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-principale-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Analyse du fichier en cours...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Erreur</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Import réussi !</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Prévisualisation */}
          {preview && !success && (
            <div className="space-y-4">
              {/* Fichier sélectionné */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {file?.name}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Résumé */}
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {preview.validCount}
                  </p>
                  <p className="text-sm text-green-600">produits valides</p>
                </div>
                {preview.errorCount > 0 && (
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">
                      {preview.errorCount}
                    </p>
                    <p className="text-sm text-red-600">erreurs</p>
                  </div>
                )}
              </div>

              {/* Liste des produits */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Produit
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Catégorie
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Prix
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.rows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? "" : "bg-red-50"}
                        >
                          <td className="px-3 py-2 text-gray-500">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-medium text-gray-900">
                              {row.name || "—"}
                            </span>
                            {(row.isOrganic || row.isLocal) && (
                              <div className="flex gap-1 mt-0.5">
                                {row.isOrganic && (
                                  <Badge className="text-xs bg-green-100 text-green-700">
                                    Bio
                                  </Badge>
                                )}
                                {row.isLocal && (
                                  <Badge className="text-xs bg-blue-100 text-blue-700">
                                    Local
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.category || "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.price > 0 ? `${row.price.toFixed(2)}€/${row.unit}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className="flex items-start gap-1">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-red-600">
                                  {row.errors.map((err, i) => (
                                    <div key={i}>{err}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {preview.errorCount > 0 && (
                <p className="text-sm text-amber-600">
                  Les {preview.errorCount} ligne(s) avec erreurs seront ignorées lors de l&apos;import.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {success ? "Fermer" : "Annuler"}
          </Button>
          {preview && !success && preview.validCount > 0 && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Importer {preview.validCount} produit{preview.validCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
