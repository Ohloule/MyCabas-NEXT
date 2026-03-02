"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  CalendarDays,
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Package,
  Plane,
  Save,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ParametresPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Notifications ---
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  // --- Commandes ---
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState("1");
  const [deadlineHour, setDeadlineHour] = useState("19");
  const [deadlineMinute, setDeadlineMinute] = useState("00");

  // --- Frais bancaires ---
  const [stripeFeePaidBy, setStripeFeePaidBy] = useState<"VENDOR" | "CUSTOMER">(
    "VENDOR",
  );

  // --- Mode vacances ---
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationStart, setVacationStart] = useState<Date | undefined>(
    undefined,
  );
  const [vacationEnd, setVacationEnd] = useState<Date | undefined>(undefined);

  // Charger les paramètres au montage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/vendor/settings");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();

        setNotifPush(data.notifPush);
        setNotifEmail(data.notifEmail);
        setNotifSms(data.notifSms);
        setAutoConfirm(data.autoConfirm);
        setDeadlineDays(String(data.deadlineDaysBeforeDay));
        setDeadlineHour(String(data.deadlineHour).padStart(2, "0"));
        setDeadlineMinute(String(data.deadlineMinute).padStart(2, "0"));
        setVacationMode(data.vacationMode);
        setVacationStart(
          data.vacationStart ? new Date(data.vacationStart) : undefined,
        );
        setVacationEnd(
          data.vacationEnd ? new Date(data.vacationEnd) : undefined,
        );
        setStripeFeePaidBy(
          data.stripeFeePaidBy === "CUSTOMER" ? "CUSTOMER" : "VENDOR",
        );
      } catch (err) {
        toast.error("Impossible de charger vos paramètres");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifPush,
          notifEmail,
          notifSms,
          autoConfirm,
          deadlineDaysBeforeDay: Number(deadlineDays),
          deadlineHour: Number(deadlineHour),
          deadlineMinute: Number(deadlineMinute),
          vacationMode,
          vacationStart: vacationStart ?? null,
          vacationEnd: vacationEnd ?? null,
          stripeFeePaidBy,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      toast.success("Paramètres enregistrés avec succès");
    } catch (err) {
      toast.error(
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
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-principale-100 rounded-lg">
          <Settings className="w-6 h-6 text-principale-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-principale-800">
            Paramètres boutique
          </h1>
          <p className="text-neutre-600">
            Gérez les préférences de votre espace vendeur
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Notifications ─────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choisissez comment vous souhaitez être alerté
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="notif-push"
                  className="font-medium cursor-pointer"
                >
                  Notifications push
                </Label>
                <p className="text-sm text-neutre-500">
                  Alertes en temps réel sur votre appareil
                </p>
              </div>
              <Checkbox
                id="notif-push"
                checked={notifPush}
                onCheckedChange={(v) => setNotifPush(!!v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="notif-email"
                  className="font-medium cursor-pointer"
                >
                  Notifications par e-mail
                </Label>
                <p className="text-sm text-neutre-500">
                  Résumés et alertes envoyés par e-mail
                </p>
              </div>
              <Checkbox
                id="notif-email"
                checked={notifEmail}
                onCheckedChange={(v) => setNotifEmail(!!v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="notif-sms"
                  className="font-medium cursor-pointer"
                >
                  Notifications par SMS
                </Label>
                <p className="text-sm text-neutre-500">
                  Messages courts pour les alertes urgentes
                </p>
              </div>
              <Checkbox
                id="notif-sms"
                checked={notifSms}
                onCheckedChange={(v) => setNotifSms(!!v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Commandes ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Commandes
            </CardTitle>
            <CardDescription>
              Paramétrez la gestion de vos commandes entrantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confirmation automatique */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Confirmation automatique</Label>
                <p className="text-sm text-neutre-500">
                  Accepter les nouvelles commandes sans validation manuelle
                </p>
              </div>
              <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
            </div>

            <Separator />

            {/* Date limite de commande */}
            <div className="space-y-3">
              <div>
                <Label className="font-medium">Date limite de commande</Label>
                <p className="text-sm text-neutre-500 mt-0.5">
                  Jusqu'à quand les clients peuvent-ils commander avant le jour
                  du marché ?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                {/* Nombre de jours avant */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutre-600">
                    Jours avant le marché
                  </Label>
                  <Select value={deadlineDays} onValueChange={setDeadlineDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Le jour même</SelectItem>
                      <SelectItem value="1">La veille (J-1)</SelectItem>
                      <SelectItem value="2">Avant-veille (J-2)</SelectItem>
                      <SelectItem value="3">3 jours avant</SelectItem>
                      <SelectItem value="4">4 jours avant</SelectItem>
                      <SelectItem value="5">5 jours avant</SelectItem>
                      <SelectItem value="7">1 semaine avant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Heure */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutre-600">Heure</Label>
                  <Select value={deadlineHour} onValueChange={setDeadlineHour}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i).padStart(2, "0")}>
                          {String(i).padStart(2, "0")} h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minutes */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutre-600">Minutes</Label>
                  <Select
                    value={deadlineMinute}
                    onValueChange={setDeadlineMinute}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00">00</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Résumé lisible */}
              <div className="bg-principale-50 border border-principale-100 rounded-lg px-4 py-2.5 text-sm text-principale-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>
                  Les commandes ferment{" "}
                  <strong>
                    {deadlineDays === "0"
                      ? "le jour même"
                      : deadlineDays === "1"
                        ? "la veille"
                        : `${deadlineDays} jours avant`}
                  </strong>{" "}
                  à{" "}
                  <strong>
                    {deadlineHour}h{deadlineMinute}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Frais bancaires ────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Frais de paiement Stripe
            </CardTitle>
            <CardDescription>
              Chaque paiement en ligne coûte{" "}
              <strong className="text-neutre-700">0,25€ + 1,5%</strong> du
              montant de la commande
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Explication contextuelle des frais */}
            <div className="bg-neutre-50 border border-neutre-200 rounded-lg px-4 py-3 text-sm text-neutre-600 space-y-1">
              <p className="font-medium text-neutre-700">Exemple concret</p>
              <p>
                Pour une commande de <strong>30€</strong> :{" "}
                <span className="text-neutre-500">0,25€ + 0,45€</span> ={" "}
                <strong className="text-neutre-800">
                  0,70€ de frais Stripe
                </strong>
              </p>
            </div>

            {/* Sélection du mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option VENDOR — recommandée */}
              <button
                type="button"
                onClick={() => setStripeFeePaidBy("VENDOR")}
                className={cn(
                  "relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none",
                  stripeFeePaidBy === "VENDOR"
                    ? "border-principale-500 bg-principale-50"
                    : "border-neutre-200 bg-white hover:border-neutre-300",
                )}
              >
                {/* Badge recommandé */}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold text-principale-700 bg-principale-100 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Recommandé
                </span>

                <div className="flex items-start gap-3 pr-20">
                  <div
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center",
                      stripeFeePaidBy === "VENDOR"
                        ? "border-principale-500 bg-principale-500"
                        : "border-neutre-300",
                    )}
                  >
                    {stripeFeePaidBy === "VENDOR" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-neutre-800 text-sm">
                      Je les inclus dans mes prix
                    </p>
                    <p className="text-xs text-neutre-500 leading-relaxed">
                      Aucune surprise pour le client. Intégrez simplement les
                      frais dans vos tarifs — c'est la méthode la plus fluide et
                      la plus transparente.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option CUSTOMER */}
              <button
                type="button"
                onClick={() => setStripeFeePaidBy("CUSTOMER")}
                className={cn(
                  "relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none",
                  stripeFeePaidBy === "CUSTOMER"
                    ? "border-principale-500 bg-principale-50"
                    : "border-neutre-200 bg-white hover:border-neutre-300",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center",
                      stripeFeePaidBy === "CUSTOMER"
                        ? "border-principale-500 bg-principale-500"
                        : "border-neutre-300",
                    )}
                  >
                    {stripeFeePaidBy === "CUSTOMER" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutre-800 text-sm">
                        Le client les paie
                      </p>
                      <Users className="h-3.5 w-3.5 text-neutre-400" />
                    </div>
                    <p className="text-xs text-neutre-500 leading-relaxed">
                      Les frais sont calculés et ajoutés automatiquement au
                      total lors du paiement.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Message contextuel selon le choix */}
            {stripeFeePaidBy === "VENDOR" ? (
              <div className="flex items-start gap-2.5 bg-principale-50 border border-principale-200 rounded-lg px-4 py-3 text-sm text-principale-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-principale-600" />
                <span>
                  <strong>Astuce :</strong> Ajoutez environ{" "}
                  <strong>2 à 3 %</strong> à vos prix pour couvrir les frais
                  sans y penser. Vos clients voient un prix net, sans ligne de
                  frais supplémentaire au moment de payer.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 bg-secondaire-50 border border-secondaire-200 rounded-lg px-4 py-3 text-sm text-secondaire-800">
                <CreditCard className="h-4 w-4 shrink-0 mt-0.5 text-secondaire-600" />
                <span>
                  Les frais Stripe seront affichés séparément et ajoutés au
                  total de la commande lors du paiement. Certains clients
                  peuvent trouver cela moins agréable.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Mode Vacances ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plane className="h-5 w-5" />
              Mode Vacances
            </CardTitle>
            <CardDescription>
              Suspendez votre boutique temporairement sans la supprimer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Activer le mode vacances</Label>
                <p className="text-sm text-neutre-500">
                  Votre boutique sera suspendue pendant la période définie
                </p>
              </div>
              <Switch
                checked={vacationMode}
                onCheckedChange={setVacationMode}
              />
            </div>

            {vacationMode && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm text-secondaire-700 bg-secondaire-50 border border-secondaire-200 rounded-lg px-4 py-2.5">
                    Pendant le mode vacances, votre boutique ne sera plus
                    visible et aucune commande ne pourra être passée.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date de début */}
                    <div className="space-y-1.5">
                      <Label className="text-sm text-neutre-600 font-medium">
                        Début des vacances
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !vacationStart && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {vacationStart
                              ? format(vacationStart, "d MMMM yyyy", {
                                  locale: fr,
                                })
                              : "Choisir une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={vacationStart}
                            onSelect={setVacationStart}
                            disabled={(date) => date < new Date()}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date de fin */}
                    <div className="space-y-1.5">
                      <Label className="text-sm text-neutre-600 font-medium">
                        Fin des vacances
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !vacationEnd && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {vacationEnd
                              ? format(vacationEnd, "d MMMM yyyy", {
                                  locale: fr,
                                })
                              : "Choisir une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={vacationEnd}
                            onSelect={setVacationEnd}
                            disabled={(date) =>
                              date < (vacationStart ?? new Date())
                            }
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Résumé vacances */}
                  {vacationStart && vacationEnd && (
                    <div className="bg-principale-50 border border-principale-100 rounded-lg px-4 py-2.5 text-sm text-principale-700 flex items-center gap-2">
                      <Plane className="h-4 w-4 shrink-0" />
                      <span>
                        Boutique suspendue du{" "}
                        <strong>
                          {format(vacationStart, "d MMMM", { locale: fr })}
                        </strong>{" "}
                        au{" "}
                        <strong>
                          {format(vacationEnd, "d MMMM yyyy", { locale: fr })}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Bouton Sauvegarder ─────────────────────────── */}
        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader taille={16} /> : <Save className="h-4 w-4" />}
            Enregistrer les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}
