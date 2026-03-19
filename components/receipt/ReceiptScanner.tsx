"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReceiptResults from "./ReceiptResults";
import type { ReceiptScanResult } from "@/lib/ai/scan-receipt";

export default function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setResult(data as ReceiptScanResult);
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Zone d'upload */}
      {!preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-neu-300 rounded-2xl p-10 flex flex-col items-center gap-4 hover:border-prin-500 hover:bg-prin-50/50 transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-prin-100 flex items-center justify-center">
            <Camera className="w-8 h-8 text-prin-600" />
          </div>
          <div className="text-center">
            <p className="text-neu-800 font-semibold text-lg">
              Photographiez votre ticket
            </p>
            <p className="text-neu-500 text-sm mt-1">
              Prenez en photo ou importez une image de votre ticket de caisse
            </p>
          </div>
          <div className="flex items-center gap-2 text-prin-600 text-sm font-medium">
            <Upload className="w-4 h-4" />
            Choisir une image
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      {preview && !result && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-neu-200 bg-neu-50">
            <img
              src={preview}
              alt="Aperçu du ticket"
              className="w-full max-h-[400px] object-contain"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="flex-1"
            >
              Changer d&apos;image
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyse en cours...
                </>
              ) : (
                "Analyser mon ticket"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleAnalyze}
              className="text-red-600 text-sm font-medium mt-2 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div className="space-y-4">
          <ReceiptResults result={result} />
          <Button variant="outline" onClick={handleReset} className="w-full">
            Scanner un autre ticket
          </Button>
        </div>
      )}
    </div>
  );
}
