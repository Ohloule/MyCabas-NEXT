"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Bell,
  Calendar,
  Carrot,
  Check,
  Clock,
  Copy,
  CreditCard,
  Euro,
  Eye,
  Filter,
  Globe,
  ImageIcon,
  Infinity as InfinityIcon,
  Instagram,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────

type SectionId =
  | "dashboard"
  | "profil"
  | "vitrine"
  | "marches"
  | "etal"
  | "commandes"
  | "facturations"
  | "notifications"
  | "parametres";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Market {
  id: string;
  name: string;
  town: string;
}

interface ProductPrice {
  id: string;
  price: number | null;
  isAvailable: boolean;
  market: { id: string; name: string };
}

interface ProductStock {
  id: string;
  quantity: number | null;
  isUnlimited: boolean;
  market: { id: string; name: string };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  basePrice: number;
  isOrganic: boolean;
  isLocal: boolean;
  isActive: boolean;
  category: Category;
  pricesByMarket: ProductPrice[];
  stocksByMarket: ProductStock[];
}

interface EditableRow {
  productId: string;
  price: string;
  quantity: string;
  isAvailable: boolean;
  isUnlimited: boolean;
  isDirty: boolean;
}

// ─── Demo Data ────────────────────────────────────────

const DEMO_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Fruits & Légumes", slug: "fruits-legumes" },
  { id: "cat-2", name: "Viandes & Charcuterie", slug: "viandes-charcuterie" },
  { id: "cat-3", name: "Poissons & Fruits de mer", slug: "poissons-fruits-de-mer" },
  { id: "cat-4", name: "Fromages & Produits laitiers", slug: "fromages-produits-laitiers" },
  { id: "cat-5", name: "Boulangerie & Pâtisserie", slug: "boulangerie-patisserie" },
  { id: "cat-6", name: "Épicerie & Condiments", slug: "epicerie-condiments" },
  { id: "cat-7", name: "Boissons", slug: "boissons" },
  { id: "cat-8", name: "Bio & Nature", slug: "bio-nature" },
];

const DEMO_MARKETS: Market[] = [
  { id: "market-1", name: "Marché de Belleville", town: "Paris 20e" },
  { id: "market-2", name: "Marché des Batignolles", town: "Paris 17e" },
];

const UNITS = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "piece", label: "Pièce" },
  { value: "botte", label: "Botte" },
  { value: "lot", label: "Lot" },
  { value: "barquette", label: "Barquette" },
  { value: "litre", label: "Litre (L)" },
];

function makePrice(id: string, marketId: string, marketName: string, price: number | null, isAvailable: boolean): ProductPrice {
  return { id, price, isAvailable, market: { id: marketId, name: marketName } };
}
function makeStock(id: string, marketId: string, marketName: string, quantity: number | null, isUnlimited: boolean): ProductStock {
  return { id, quantity, isUnlimited, market: { id: marketId, name: marketName } };
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Tomates cerises", description: "Tomates cerises de plein champ, variété ancienne", imageUrl: null, unit: "kg", basePrice: 5.9, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[0], pricesByMarket: [makePrice("pp1a","market-1","Marché de Belleville",null,true), makePrice("pp1b","market-2","Marché des Batignolles",6.5,true)], stocksByMarket: [makeStock("ps1a","market-1","Marché de Belleville",null,true), makeStock("ps1b","market-2","Marché des Batignolles",20,false)] },
  { id: "p2", name: "Pommes Golden", description: "Pommes Golden du Limousin", imageUrl: null, unit: "kg", basePrice: 3.5, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[0], pricesByMarket: [makePrice("pp2a","market-1","Marché de Belleville",3.2,true), makePrice("pp2b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps2a","market-1","Marché de Belleville",50,false), makeStock("ps2b","market-2","Marché des Batignolles",null,true)] },
  { id: "p3", name: "Saucisson sec artisanal", description: "Saucisson sec pur porc, séché 3 mois", imageUrl: null, unit: "piece", basePrice: 8.5, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[1], pricesByMarket: [makePrice("pp3a","market-1","Marché de Belleville",null,true), makePrice("pp3b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps3a","market-1","Marché de Belleville",30,false), makeStock("ps3b","market-2","Marché des Batignolles",25,false)] },
  { id: "p4", name: "Côtes d'agneau", description: "Côtes d'agneau de pré-salé", imageUrl: null, unit: "kg", basePrice: 24.9, isOrganic: false, isLocal: false, isActive: true, category: DEMO_CATEGORIES[1], pricesByMarket: [makePrice("pp4a","market-1","Marché de Belleville",22.9,true), makePrice("pp4b","market-2","Marché des Batignolles",null,false)], stocksByMarket: [makeStock("ps4a","market-1","Marché de Belleville",10,false), makeStock("ps4b","market-2","Marché des Batignolles",null,true)] },
  { id: "p5", name: "Bar de ligne", description: "Bar de ligne pêché en Bretagne", imageUrl: null, unit: "kg", basePrice: 32.0, isOrganic: false, isLocal: false, isActive: true, category: DEMO_CATEGORIES[2], pricesByMarket: [makePrice("pp5a","market-1","Marché de Belleville",null,true), makePrice("pp5b","market-2","Marché des Batignolles",34.0,true)], stocksByMarket: [makeStock("ps5a","market-1","Marché de Belleville",8,false), makeStock("ps5b","market-2","Marché des Batignolles",5,false)] },
  { id: "p6", name: "Crevettes roses", description: "Crevettes roses fraîches, pêche du jour", imageUrl: null, unit: "kg", basePrice: 18.5, isOrganic: false, isLocal: false, isActive: false, category: DEMO_CATEGORIES[2], pricesByMarket: [makePrice("pp6a","market-1","Marché de Belleville",null,false), makePrice("pp6b","market-2","Marché des Batignolles",null,false)], stocksByMarket: [makeStock("ps6a","market-1","Marché de Belleville",null,true), makeStock("ps6b","market-2","Marché des Batignolles",null,true)] },
  { id: "p7", name: "Comté 18 mois", description: "Comté AOP affiné 18 mois, Jura", imageUrl: null, unit: "kg", basePrice: 22.0, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[3], pricesByMarket: [makePrice("pp7a","market-1","Marché de Belleville",null,true), makePrice("pp7b","market-2","Marché des Batignolles",23.5,true)], stocksByMarket: [makeStock("ps7a","market-1","Marché de Belleville",null,true), makeStock("ps7b","market-2","Marché des Batignolles",null,true)] },
  { id: "p8", name: "Yaourts nature fermiers", description: "Lot de 4 yaourts nature au lait entier", imageUrl: null, unit: "lot", basePrice: 4.2, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[3], pricesByMarket: [makePrice("pp8a","market-1","Marché de Belleville",null,true), makePrice("pp8b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps8a","market-1","Marché de Belleville",40,false), makeStock("ps8b","market-2","Marché des Batignolles",30,false)] },
  { id: "p9", name: "Pain au levain", description: "Pain au levain naturel, farine bio T80", imageUrl: null, unit: "piece", basePrice: 4.5, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[4], pricesByMarket: [makePrice("pp9a","market-1","Marché de Belleville",null,true), makePrice("pp9b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps9a","market-1","Marché de Belleville",25,false), makeStock("ps9b","market-2","Marché des Batignolles",20,false)] },
  { id: "p10", name: "Croissants pur beurre", description: "Croissants pur beurre AOP, fait main", imageUrl: null, unit: "piece", basePrice: 1.4, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[4], pricesByMarket: [makePrice("pp10a","market-1","Marché de Belleville",1.3,true), makePrice("pp10b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps10a","market-1","Marché de Belleville",60,false), makeStock("ps10b","market-2","Marché des Batignolles",50,false)] },
  { id: "p11", name: "Huile d'olive vierge extra", description: "Huile d'olive de Nyons AOP", imageUrl: null, unit: "litre", basePrice: 14.9, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[5], pricesByMarket: [makePrice("pp11a","market-1","Marché de Belleville",null,true), makePrice("pp11b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps11a","market-1","Marché de Belleville",null,true), makeStock("ps11b","market-2","Marché des Batignolles",null,true)] },
  { id: "p12", name: "Miel de lavande", description: "Miel de lavande de Provence, récolte artisanale", imageUrl: null, unit: "piece", basePrice: 9.9, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[5], pricesByMarket: [makePrice("pp12a","market-1","Marché de Belleville",null,true), makePrice("pp12b","market-2","Marché des Batignolles",10.5,true)], stocksByMarket: [makeStock("ps12a","market-1","Marché de Belleville",15,false), makeStock("ps12b","market-2","Marché des Batignolles",12,false)] },
  { id: "p13", name: "Jus de pomme artisanal", description: "Jus de pomme trouble, pressé à froid", imageUrl: null, unit: "litre", basePrice: 4.9, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[6], pricesByMarket: [makePrice("pp13a","market-1","Marché de Belleville",null,true), makePrice("pp13b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps13a","market-1","Marché de Belleville",null,true), makeStock("ps13b","market-2","Marché des Batignolles",null,true)] },
  { id: "p14", name: "Vin rosé de Provence", description: "Côtes de Provence AOP, millésime 2024", imageUrl: null, unit: "piece", basePrice: 11.5, isOrganic: false, isLocal: false, isActive: true, category: DEMO_CATEGORIES[6], pricesByMarket: [makePrice("pp14a","market-1","Marché de Belleville",null,true), makePrice("pp14b","market-2","Marché des Batignolles",12.0,true)], stocksByMarket: [makeStock("ps14a","market-1","Marché de Belleville",24,false), makeStock("ps14b","market-2","Marché des Batignolles",18,false)] },
  { id: "p15", name: "Tisane aux herbes bio", description: "Mélange de plantes aromatiques bio séchées", imageUrl: null, unit: "piece", basePrice: 6.5, isOrganic: true, isLocal: true, isActive: true, category: DEMO_CATEGORIES[7], pricesByMarket: [makePrice("pp15a","market-1","Marché de Belleville",null,true), makePrice("pp15b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps15a","market-1","Marché de Belleville",null,true), makeStock("ps15b","market-2","Marché des Batignolles",null,true)] },
  { id: "p16", name: "Savon de Marseille", description: "Véritable savon de Marseille à l'huile d'olive, 300g", imageUrl: null, unit: "piece", basePrice: 5.0, isOrganic: false, isLocal: true, isActive: true, category: DEMO_CATEGORIES[7], pricesByMarket: [makePrice("pp16a","market-1","Marché de Belleville",4.8,true), makePrice("pp16b","market-2","Marché des Batignolles",null,true)], stocksByMarket: [makeStock("ps16a","market-1","Marché de Belleville",40,false), makeStock("ps16b","market-2","Marché des Batignolles",35,false)] },
];

// ─── Helpers ────────────────────────────────────────

const categoryColors: Record<string, string> = {
  "fruits-legumes": "bg-green-100 text-green-800",
  "viandes-charcuterie": "bg-red-100 text-red-800",
  "poissons-fruits-de-mer": "bg-blue-100 text-blue-800",
  "fromages-produits-laitiers": "bg-yellow-100 text-yellow-800",
  "boulangerie-patisserie": "bg-amber-100 text-amber-800",
  "epicerie-condiments": "bg-orange-100 text-orange-800",
  boissons: "bg-purple-100 text-purple-800",
  "bio-nature": "bg-emerald-100 text-emerald-800",
};

let nextId = 100;
function generateId() { return `demo-${nextId++}`; }

function getPriceRange(product: Product) {
  const prices = product.pricesByMarket.filter((p) => p.price !== null).map((p) => p.price as number);
  if (prices.length === 0) return `${product.basePrice.toFixed(2)}€`;
  prices.push(product.basePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min.toFixed(2)}€`;
  return `${min.toFixed(2)}€ - ${max.toFixed(2)}€`;
}

function getTotalStock(product: Product) {
  const hasUnlimited = product.stocksByMarket.some((s) => s.isUnlimited);
  if (hasUnlimited || product.stocksByMarket.length === 0) return null;
  return product.stocksByMarket.reduce((acc, s) => acc + (s.quantity || 0), 0);
}

function getAvailableMarkets(product: Product) {
  const available = product.pricesByMarket.filter((p) => p.isAvailable).length;
  const total = product.pricesByMarket.length;
  if (total === 0) return "—";
  return `${available}/${total}`;
}

// ─── Sidebar Menu ─────────────────────────────────────

const sidebarMenuItems: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "profil", label: "Mes informations", icon: User },
  { id: "vitrine", label: "Ma vitrine", icon: Store },
  { id: "marches", label: "Mes marchés", icon: MapPin },
  { id: "etal", label: "Mon étal", icon: Carrot },
  { id: "commandes", label: "Commandes à venir", icon: Package },
  { id: "facturations", label: "Facturations", icon: Receipt },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "parametres", label: "Paramètres boutique", icon: Settings },
];

// ══════════════════════════════════════════════════════
// SECTION: Tableau de bord
// ══════════════════════════════════════════════════════

function SectionDashboard({ productCount }: { productCount: number }) {
  const stats = [
    { label: "Commandes à préparer", value: "5", icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "CA ce mois", value: "2 450€", icon: TrendingUp, color: "bg-secondaire-100 text-secondaire-600" },
    { label: "Marchés actifs", value: "2", icon: MapPin, color: "bg-purple-100 text-purple-600" },
    { label: "Produits en ligne", value: String(productCount), icon: Carrot, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><LayoutDashboard className="w-6 h-6 text-secondaire-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-secondaire-800">Bonjour, Jean !</h1>
          <p className="text-gray-600">Voici un aperçu de votre activité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Prochaines commandes</h2>
          {[
            { client: "Marie D.", items: 3, total: "24.50€", market: "Belleville", date: "Sam. 22 fév." },
            { client: "Pierre L.", items: 5, total: "47.80€", market: "Batignolles", date: "Dim. 23 fév." },
            { client: "Sophie M.", items: 2, total: "15.90€", market: "Belleville", date: "Sam. 22 fév." },
          ].map((o, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{o.client}</p>
                <p className="text-sm text-gray-500">{o.items} articles &middot; {o.market}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{o.total}</p>
                <p className="text-sm text-gray-500">{o.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Prochains marchés</h2>
          {DEMO_MARKETS.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="p-2 bg-secondaire-100 rounded-lg"><MapPin className="w-5 h-5 text-secondaire-600" /></div>
              <div>
                <p className="font-medium text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-500">{m.town} &middot; Samedi 8h-14h</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Mes informations
// ══════════════════════════════════════════════════════

function SectionProfil() {
  const [stallName, setStallName] = useState("La Ferme de Jean");
  const [companyName] = useState("SARL La Ferme de Jean");
  const [siret] = useState("123 456 789 00012");
  const [phone, setPhone] = useState("06 12 34 56 78");
  const [email, setEmail] = useState("jean@lafermedejean.fr");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><User className="w-6 h-6 text-secondaire-600" /></div>
        <h1 className="text-3xl font-bold text-secondaire-800">Mes informations</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Informations légales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Raison sociale</Label><p className="mt-1 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{companyName}</p></div>
            <div><Label>SIRET</Label><p className="mt-1 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg font-mono">{siret}</p></div>
            <div><Label>Adresse du siège</Label><p className="mt-1 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">12 rue des Fermiers, 75020 Paris</p></div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Ces informations ne sont pas modifiables en ligne. Contactez le support pour toute modification.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Coordonnées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-stall">Nom de l&apos;étal</Label>
              <Input id="demo-stall" value={stallName} onChange={(e) => { setStallName(e.target.value); setSaved(false); }} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="demo-phone">Téléphone</Label>
              <Input id="demo-phone" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input id="demo-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false); }} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button className="bg-secondaire-600 hover:bg-secondaire-700" onClick={() => setSaved(true)}><Save className="w-4 h-4" />Enregistrer</Button>
            {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" />Sauvegardé</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Informations bancaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>IBAN</Label><p className="mt-1 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg font-mono">FR76 •••• •••• •••• •••• ••42</p></div>
            <div><Label>BIC</Label><p className="mt-1 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg font-mono">BNPAFRPP</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Ma vitrine
// ══════════════════════════════════════════════════════

function SectionVitrine() {
  const [description, setDescription] = useState("Producteur local depuis 3 générations, nous cultivons fruits et légumes de saison en agriculture raisonnée dans notre ferme du Limousin.");
  const [website, setWebsite] = useState("www.lafermedejean.fr");
  const [instagram, setInstagram] = useState("@lafermedejean");
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, card: true, check: false });
  const [labels, setLabels] = useState({ bio: true, local: true, artisan: false });
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><Store className="w-6 h-6 text-secondaire-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-secondaire-800">Ma vitrine</h1>
          <p className="text-gray-600">Personnalisez votre page visible par les clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Photo / Logo</h2>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-secondaire-100 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-secondaire-400" />
              </div>
              <div>
                <Button variant="outline" size="sm"><ImageIcon className="w-4 h-4" />Changer la photo</Button>
                <p className="text-xs text-gray-500 mt-1">JPG ou PNG, max 2 Mo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Description</h2>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); setSaved(false); }} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500 resize-none" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Contact & Réseaux</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1"><Globe className="w-4 h-4" />Site web</Label>
                <Input value={website} onChange={(e) => { setWebsite(e.target.value); setSaved(false); }} className="mt-1" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Instagram className="w-4 h-4" />Instagram</Label>
                <Input value={instagram} onChange={(e) => { setInstagram(e.target.value); setSaved(false); }} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Moyens de paiement acceptés</h2>
            <div className="flex flex-wrap gap-4">
              {([["cash", "Espèces", Euro], ["card", "Carte bancaire", CreditCard], ["check", "Chèque", Receipt]] as const).map(([key, label, Icon]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={paymentMethods[key]} onCheckedChange={(c) => { setPaymentMethods(p => ({ ...p, [key]: !!c })); setSaved(false); }} />
                  <Icon className="w-4 h-4 text-gray-500" /><span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Labels & Certifications</h2>
            <div className="flex flex-wrap gap-4">
              {([["bio", "Agriculture Biologique", Leaf], ["local", "Producteur Local", MapPin], ["artisan", "Artisan", Store]] as const).map(([key, label, Icon]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={labels[key]} onCheckedChange={(c) => { setLabels(p => ({ ...p, [key]: !!c })); setSaved(false); }} />
                  <Icon className="w-4 h-4 text-gray-500" /><span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-secondaire-600 hover:bg-secondaire-700" onClick={() => setSaved(true)}><Save className="w-4 h-4" />Enregistrer</Button>
            {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" />Sauvegardé</span>}
          </div>
        </div>

        {/* Preview card */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
            <div className="bg-secondaire-600 h-20" />
            <div className="p-4 -mt-8">
              <div className="w-16 h-16 rounded-xl bg-secondaire-100 border-4 border-white flex items-center justify-center mb-3">
                <Store className="w-8 h-8 text-secondaire-400" />
              </div>
              <h3 className="font-bold text-gray-900">La Ferme de Jean</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-3">{description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {labels.bio && <Badge className="bg-green-100 text-green-800 text-xs"><Leaf className="w-3 h-3" />Bio</Badge>}
                {labels.local && <Badge className="bg-blue-100 text-blue-800 text-xs"><MapPin className="w-3 h-3" />Local</Badge>}
                {labels.artisan && <Badge className="bg-amber-100 text-amber-800 text-xs">Artisan</Badge>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm text-gray-600">
                {website && <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{website}</p>}
                {instagram && <p className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5" />{instagram}</p>}
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Eye className="w-3 h-3" />Aperçu client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Mes marchés
// ══════════════════════════════════════════════════════

function SectionMarches() {
  const marketsData = [
    { ...DEMO_MARKETS[0], days: [{ day: "Samedi", hours: "8h00 - 14h00" }, { day: "Mercredi", hours: "8h00 - 13h00" }], address: "Boulevard de Belleville" },
    { ...DEMO_MARKETS[1], days: [{ day: "Samedi", hours: "9h00 - 14h00" }], address: "Place des Batignolles" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondaire-100 rounded-lg"><MapPin className="w-6 h-6 text-secondaire-600" /></div>
          <div>
            <h1 className="text-3xl font-bold text-secondaire-800">Mes marchés</h1>
            <p className="text-gray-600">{marketsData.length} marché(s) inscrits</p>
          </div>
        </div>
        <Button className="bg-secondaire-600 hover:bg-secondaire-700"><Plus className="w-4 h-4" />Trouver un marché</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {marketsData.map((m) => (
          <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{m.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{m.address}, {m.town}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Actif</Badge>
            </div>
            <div className="space-y-2">
              {m.days.map((d) => (
                <div key={d.day} className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700 w-24">{d.day}</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{d.hours}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm"><Pencil className="w-4 h-4" />Modifier les jours</Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Se désinscrire</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Commandes à venir
// ══════════════════════════════════════════════════════

function SectionCommandes() {
  const [tab, setTab] = useState<"pending" | "confirmed" | "all">("pending");
  const orders = [
    { id: "CMD-2024-001", client: "Marie Dupont", items: [{ name: "Tomates cerises", qty: "2 kg", price: "11.80€" }, { name: "Pain au levain", qty: "1 pièce", price: "4.50€" }], total: "16.30€", market: "Belleville", date: "Sam. 22 fév.", status: "pending" as const },
    { id: "CMD-2024-002", client: "Pierre Lambert", items: [{ name: "Comté 18 mois", qty: "500 g", price: "11.00€" }, { name: "Miel de lavande", qty: "1 pot", price: "9.90€" }, { name: "Jus de pomme", qty: "2 L", price: "9.80€" }], total: "30.70€", market: "Batignolles", date: "Dim. 23 fév.", status: "pending" as const },
    { id: "CMD-2024-003", client: "Sophie Martin", items: [{ name: "Croissants pur beurre", qty: "6 pièces", price: "8.40€" }, { name: "Yaourts fermiers", qty: "2 lots", price: "8.40€" }], total: "16.80€", market: "Belleville", date: "Sam. 22 fév.", status: "confirmed" as const },
    { id: "CMD-2024-004", client: "Luc Bernard", items: [{ name: "Saucisson sec", qty: "2 pièces", price: "17.00€" }, { name: "Vin rosé", qty: "1 bout.", price: "11.50€" }], total: "28.50€", market: "Batignolles", date: "Dim. 23 fév.", status: "confirmed" as const },
  ];

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status === tab);
  const statusColors = { pending: "bg-amber-100 text-amber-800", confirmed: "bg-green-100 text-green-800" };
  const statusLabels = { pending: "À confirmer", confirmed: "Confirmée" };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><Package className="w-6 h-6 text-secondaire-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-secondaire-800">Commandes à venir</h1>
          <p className="text-gray-600">{orders.length} commande(s)</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([["pending", "À confirmer", orders.filter(o => o.status === "pending").length], ["confirmed", "Confirmées", orders.filter(o => o.status === "confirmed").length], ["all", "Toutes", orders.length]] as const).map(([id, label, count]) => (
          <Button key={id} variant={tab === id ? "default" : "outline"} size="sm" onClick={() => setTab(id)} className={tab === id ? "bg-secondaire-600 hover:bg-secondaire-700" : ""}>
            {label} <Badge variant="secondary" className="ml-1">{count}</Badge>
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((o) => (
          <div key={o.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg"><ShoppingBag className="w-5 h-5 text-gray-600" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{o.id}</span>
                    <Badge className={statusColors[o.status]}>{statusLabels[o.status]}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{o.client} &middot; {o.market} &middot; {o.date}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{o.total}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {o.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name} <span className="text-gray-400">x {item.qty}</span></span>
                  <span className="font-medium text-gray-900">{item.price}</span>
                </div>
              ))}
            </div>
            {o.status === "pending" && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" className="bg-secondaire-600 hover:bg-secondaire-700"><Check className="w-4 h-4" />Confirmer</Button>
                <Button variant="outline" size="sm"><Pencil className="w-4 h-4" />Ajuster</Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">Refuser</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Facturations
// ══════════════════════════════════════════════════════

function SectionFacturations() {
  const invoices = [
    { id: "FAC-2024-012", date: "01/02/2024", period: "Janvier 2024", amount: "1 245.80€", status: "paid" },
    { id: "FAC-2024-011", date: "01/01/2024", period: "Décembre 2023", amount: "980.50€", status: "paid" },
    { id: "FAC-2024-010", date: "01/12/2023", period: "Novembre 2023", amount: "1 102.30€", status: "paid" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><Receipt className="w-6 h-6 text-secondaire-600" /></div>
        <h1 className="text-3xl font-bold text-secondaire-800">Facturations</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 font-medium text-gray-900">{inv.id}</td>
                <td className="px-4 py-4 text-gray-600">{inv.period}</td>
                <td className="px-4 py-4 text-gray-600">{inv.date}</td>
                <td className="px-4 py-4 font-medium text-gray-900">{inv.amount}</td>
                <td className="px-4 py-4"><Badge className="bg-green-100 text-green-800">Payée</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Notifications
// ══════════════════════════════════════════════════════

function SectionNotifications() {
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "Nouvelle commande", message: "Marie Dupont a passé une commande de 16.30€ pour le marché de Belleville.", time: "Il y a 2h", read: false, icon: ShoppingBag },
    { id: "n2", title: "Commande confirmée", message: "Sophie Martin a confirmé sa commande CMD-2024-003.", time: "Il y a 5h", read: false, icon: Check },
    { id: "n3", title: "Rappel marché", message: "N'oubliez pas de préparer vos produits pour le marché de Belleville samedi.", time: "Hier", read: true, icon: Calendar },
    { id: "n4", title: "Stock bas", message: "Le stock de Crevettes roses est épuisé sur le marché des Batignolles.", time: "Il y a 2 jours", read: true, icon: AlertCircle },
    { id: "n5", title: "Nouveau marché disponible", message: "Le Marché de Montreuil recherche des producteurs. Inscrivez-vous !", time: "Il y a 3 jours", read: true, icon: MapPin },
  ]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondaire-100 rounded-lg"><Bell className="w-6 h-6 text-secondaire-600" /></div>
          <div>
            <h1 className="text-3xl font-bold text-secondaire-800">Notifications</h1>
            {unreadCount > 0 && <p className="text-gray-600">{unreadCount} non lue(s)</p>}
          </div>
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><Check className="w-4 h-4" />Tout marquer comme lu</Button>}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-white rounded-xl p-4 shadow-sm border transition-colors cursor-pointer ${n.read ? "border-gray-100" : "border-secondaire-200 bg-secondaire-50/30"}`} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${n.read ? "bg-gray-100" : "bg-secondaire-100"}`}>
                <n.icon className={`w-5 h-5 ${n.read ? "text-gray-500" : "text-secondaire-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${n.read ? "text-gray-700" : "text-gray-900"}`}>{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 bg-secondaire-600 rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Paramètres boutique
// ══════════════════════════════════════════════════════

function SectionParametres() {
  const [orderNotif, setOrderNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [vacationMode, setVacationMode] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondaire-100 rounded-lg"><Settings className="w-6 h-6 text-secondaire-600" /></div>
        <h1 className="text-3xl font-bold text-secondaire-800">Paramètres boutique</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { label: "Notifications push pour les nouvelles commandes", desc: "Recevez une alerte à chaque nouvelle commande", checked: orderNotif, onChange: setOrderNotif },
              { label: "Notifications par email", desc: "Récapitulatif quotidien de vos commandes par email", checked: emailNotif, onChange: setEmailNotif },
            ].map((s) => (
              <label key={s.label} className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={s.checked} onCheckedChange={(c) => { s.onChange(!!c); setSaved(false); }} className="mt-0.5" />
                <div><p className="text-sm font-medium text-gray-700">{s.label}</p><p className="text-xs text-gray-500">{s.desc}</p></div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Commandes</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={autoConfirm} onCheckedChange={(c) => { setAutoConfirm(!!c); setSaved(false); }} className="mt-0.5" />
            <div><p className="text-sm font-medium text-gray-700">Confirmation automatique des commandes</p><p className="text-xs text-gray-500">Les commandes seront confirmées automatiquement sans action de votre part</p></div>
          </label>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Mode vacances</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={vacationMode} onCheckedChange={(c) => { setVacationMode(!!c); setSaved(false); }} className="mt-0.5" />
            <div><p className="text-sm font-medium text-gray-700">Activer le mode vacances</p><p className="text-xs text-gray-500">Votre boutique sera temporairement invisible et les clients ne pourront plus passer de commandes</p></div>
          </label>
          {vacationMode && <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm">Votre boutique est actuellement en mode vacances.</div>}
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-secondaire-600 hover:bg-secondaire-700" onClick={() => setSaved(true)}><Save className="w-4 h-4" />Enregistrer</Button>
          {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" />Sauvegardé</span>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Mon étal (products) - Sub-components
// ══════════════════════════════════════════════════════

function DemoProductFormDialog({ open, onOpenChange, product, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; product: Product | null; onSave: (p: Product) => void }) {
  const isEditing = !!product;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("kg");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (product) { setName(product.name); setDescription(product.description || ""); setUnit(product.unit); setBasePrice(product.basePrice.toString()); setCategoryId(product.category.id); setIsOrganic(product.isOrganic); setIsLocal(product.isLocal); setIsActive(product.isActive); }
      else { setName(""); setDescription(""); setUnit("kg"); setBasePrice(""); setCategoryId(""); setIsOrganic(false); setIsLocal(false); setIsActive(true); }
      setError(null);
    }
  }, [open, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!name.trim()) { setError("Le nom du produit est requis"); return; }
    if (!basePrice || parseFloat(basePrice) <= 0) { setError("Le prix de référence est requis"); return; }
    if (!categoryId) { setError("La catégorie est requise"); return; }
    const category = DEMO_CATEGORIES.find((c) => c.id === categoryId)!;
    const id = product?.id || generateId();
    onSave({ id, name: name.trim(), description: description.trim() || null, imageUrl: product?.imageUrl || null, unit, basePrice: parseFloat(basePrice), isOrganic, isLocal, isActive, category, pricesByMarket: product?.pricesByMarket || DEMO_MARKETS.map(m => ({ id: generateId(), price: null, isAvailable: true, market: { id: m.id, name: m.name } })), stocksByMarket: product?.stocksByMarket || DEMO_MARKETS.map(m => ({ id: generateId(), quantity: null, isUnlimited: true, market: { id: m.id, name: m.name } })) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div><Label htmlFor="demo-name">Nom du produit *</Label><Input id="demo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Tomates cerises" className="mt-1" /></div>
          <div><Label htmlFor="demo-desc">Description</Label><textarea id="demo-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" rows={2} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500 resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="demo-cat">Catégorie *</Label><select id="demo-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500"><option value="">Sélectionner</option>{DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><Label htmlFor="demo-unit">Unité de vente</Label><select id="demo-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500">{UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
          </div>
          <div><Label htmlFor="demo-price">Prix de référence *</Label><div className="mt-1 relative"><Input id="demo-price" type="number" step="0.01" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" className="pr-16" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€/{unit}</span></div></div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} className="w-4 h-4 rounded border-gray-300" /><Leaf className="w-4 h-4 text-green-600" /><span className="text-sm">Bio</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isLocal} onChange={(e) => setIsLocal(e.target.checked)} className="w-4 h-4 rounded border-gray-300" /><MapPin className="w-4 h-4 text-blue-600" /><span className="text-sm">Local</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300" /><span className="text-sm">Actif</span></label>
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button><Button type="submit" className="bg-secondaire-600 hover:bg-secondaire-700"><Save className="w-4 h-4" />{isEditing ? "Enregistrer" : "Créer"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DemoProductsTable({ products, onEdit, onDelete, onDuplicate }: { products: Product[]; onEdit: (p: Product) => void; onDelete: (id: string) => void; onDuplicate: (p: Product) => void }) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (products.length === 0) return (
    <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
      <Carrot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
      <p className="text-gray-500">Commencez par ajouter votre premier produit.</p>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0"><Image src={product.imageUrl || "/images/ingredients.jpg"} alt={product.name} width={64} height={64} className="w-full h-full object-cover" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="font-medium text-gray-900 text-sm">{product.name}</span>{product.isOrganic && <Leaf className="w-3.5 h-3.5 text-green-600 shrink-0" />}{product.isLocal && <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />}</div>
              <span className="text-xs text-gray-500">/{product.unit}</span>
            </div>
            {product.isActive ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shrink-0"><Check className="w-3 h-3" />Actif</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shrink-0"><X className="w-3 h-3" />Inactif</span>}
          </div>
          <div className="mt-2"><Badge className={`text-xs ${categoryColors[product.category.slug] || "bg-gray-100 text-gray-800"}`}>{product.category.name}</Badge></div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div><p className="text-xs text-gray-500">Prix</p><p className="text-sm font-medium text-gray-900">{getPriceRange(product)}</p></div>
        <div><p className="text-xs text-gray-500">Stock</p><div className="flex items-center justify-center text-sm font-medium text-gray-900">{getTotalStock(product) === null ? <InfinityIcon className="w-4 h-4 text-gray-400" /> : getTotalStock(product)}</div></div>
        <div><p className="text-xs text-gray-500">Marchés</p><p className="text-sm font-medium text-gray-900">{getAvailableMarkets(product)}</p></div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex-1 sm:flex-none"><Pencil className="w-4 h-4" /><span className="sm:hidden">Modifier</span></Button>
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(product)}><Copy className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden space-y-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marchés</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0"><Image src={product.imageUrl || "/images/ingredients.jpg"} alt={product.name} width={48} height={48} className="w-full h-full object-cover" /></div><div><div className="flex items-center gap-2"><span className="font-medium text-gray-900">{product.name}</span>{product.isOrganic && <span title="Bio"><Leaf className="w-4 h-4 text-green-600" /></span>}{product.isLocal && <span title="Local"><MapPin className="w-4 h-4 text-blue-600" /></span>}</div><span className="text-sm text-gray-500">/{product.unit}</span></div></div></td>
                  <td className="px-4 py-4"><Badge className={categoryColors[product.category.slug] || "bg-gray-100 text-gray-800"}>{product.category.name}</Badge></td>
                  <td className="px-4 py-4"><span className="font-medium text-gray-900">{getPriceRange(product)}</span><span className="text-gray-500">/{product.unit}</span></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1 text-gray-700">{getTotalStock(product) === null ? <InfinityIcon className="w-4 h-4 text-gray-400" /> : <>{getTotalStock(product)} <span className="text-gray-500">{product.unit}</span></>}</div></td>
                  <td className="px-4 py-4"><span className="text-gray-700">{getAvailableMarkets(product)}</span></td>
                  <td className="px-4 py-4">{product.isActive ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3" />Actif</span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><X className="w-3 h-3" />Inactif</span>}</td>
                  <td className="px-4 py-4"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => onEdit(product)} title="Modifier"><Pencil className="w-4 h-4" /></Button>
                    <div className="relative"><Button variant="ghost" size="icon" onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}><MoreHorizontal className="w-4 h-4" /></Button>
                      {openMenuId === product.id && (<><div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} /><div className="absolute right-10 -top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-35"><button onClick={() => { onDuplicate(product); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Copy className="w-4 h-4" />Dupliquer</button><button onClick={() => { onDelete(product.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" />Supprimer</button></div></>)}
                    </div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DemoProductsTableEditable({ products, marketId, marketName, onProductsChange }: { products: Product[]; marketId: string; marketName: string; onProductsChange: (p: Product[]) => void }) {
  const [editableRows, setEditableRows] = useState<Record<string, EditableRow>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const rows: Record<string, EditableRow> = {};
    products.forEach((product) => {
      const priceData = product.pricesByMarket.find(p => p.market.id === marketId);
      const stockData = product.stocksByMarket.find(s => s.market.id === marketId);
      rows[product.id] = { productId: product.id, price: priceData?.price?.toString() || product.basePrice.toString(), quantity: stockData?.quantity?.toString() || "", isAvailable: priceData?.isAvailable ?? true, isUnlimited: stockData?.isUnlimited ?? true, isDirty: false };
    });
    setEditableRows(rows);
  }, [products, marketId]);

  const handleFieldChange = (productId: string, field: keyof EditableRow, value: string | boolean) => {
    setEditableRows(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value, isDirty: true } }));
    setSuccessMessage(null);
  };
  const getDirtyRows = () => Object.values(editableRows).filter(r => r.isDirty);
  const handleSave = () => {
    const dirtyRows = getDirtyRows(); if (dirtyRows.length === 0) return;
    onProductsChange(products.map(product => { const row = editableRows[product.id]; if (!row?.isDirty) return product; return { ...product, pricesByMarket: product.pricesByMarket.map(p => p.market.id === marketId ? { ...p, price: row.price ? parseFloat(row.price) : null, isAvailable: row.isAvailable } : p), stocksByMarket: product.stocksByMarket.map(s => s.market.id === marketId ? { ...s, quantity: row.isUnlimited ? null : row.quantity ? parseInt(row.quantity) : null, isUnlimited: row.isUnlimited } : s) }; }));
    setEditableRows(prev => { const u = { ...prev }; Object.keys(u).forEach(k => { u[k] = { ...u[k], isDirty: false }; }); return u; });
    setSuccessMessage(`${dirtyRows.length} produit(s) mis à jour`);
  };
  const handleReset = () => {
    const rows: Record<string, EditableRow> = {};
    products.forEach(product => { const pd = product.pricesByMarket.find(p => p.market.id === marketId); const sd = product.stocksByMarket.find(s => s.market.id === marketId); rows[product.id] = { productId: product.id, price: pd?.price?.toString() || product.basePrice.toString(), quantity: sd?.quantity?.toString() || "", isAvailable: pd?.isAvailable ?? true, isUnlimited: sd?.isUnlimited ?? true, isDirty: false }; });
    setEditableRows(rows); setSuccessMessage(null);
  };
  const dirtyCount = getDirtyRows().length;

  if (products.length === 0) return <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"><h3 className="text-lg font-medium text-gray-900">Aucun produit</h3></div>;

  const EditableCard = ({ product }: { product: Product }) => {
    const row = editableRows[product.id]; if (!row) return null;
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-4 transition-colors ${row.isDirty ? "border-amber-300 bg-amber-50/50" : "border-gray-100"}`}>
        <div className="flex items-start gap-3 mb-4"><div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0"><Image src={product.imageUrl || "/images/ingredients.jpg"} alt={product.name} width={56} height={56} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><span className="font-medium text-gray-900 text-sm">{product.name}</span>{product.isOrganic && <Leaf className="w-3.5 h-3.5 text-green-600" />}{product.isLocal && <MapPin className="w-3.5 h-3.5 text-blue-600" />}</div><div className="flex items-center gap-2 mt-1"><Badge className={`text-xs ${categoryColors[product.category.slug] || "bg-gray-100 text-gray-800"}`}>{product.category.name}</Badge><span className="text-xs text-gray-500">Base: {product.basePrice.toFixed(2)}€/{product.unit}</span></div></div></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3"><label className="text-sm text-gray-600">Prix</label><div className="flex items-center gap-1"><Input type="number" step="0.01" min="0" value={row.price} onChange={e => handleFieldChange(product.id, "price", e.target.value)} className="w-24 h-9 text-sm" /><span className="text-sm text-gray-500">€/{product.unit}</span></div></div>
          <div className="flex items-center justify-between gap-3"><label className="text-sm text-gray-600">Stock</label>{row.isUnlimited ? <div className="flex items-center gap-1 text-gray-400 h-9 px-3"><InfinityIcon className="w-4 h-4" /><span className="text-sm">Illimité</span></div> : <div className="flex items-center gap-1"><Input type="number" min="0" value={row.quantity} onChange={e => handleFieldChange(product.id, "quantity", e.target.value)} className="w-20 h-9 text-sm" /><span className="text-sm text-gray-500">{product.unit}</span></div>}</div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100"><label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={row.isUnlimited} onCheckedChange={c => handleFieldChange(product.id, "isUnlimited", !!c)} /><span className="text-sm text-gray-700">Illimité</span></label><label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={row.isAvailable} onCheckedChange={c => handleFieldChange(product.id, "isAvailable", !!c)} /><span className="text-sm text-gray-700">Disponible</span></label></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap"><span className="text-sm text-gray-600">Marché : <strong className="text-secondaire-700">{marketName}</strong></span>{dirtyCount > 0 && <Badge variant="secondary" className="bg-amber-100 text-amber-800">{dirtyCount} modification{dirtyCount > 1 ? "s" : ""}</Badge>}</div>
        <div className="flex items-center gap-2">{dirtyCount > 0 && <Button variant="outline" size="sm" onClick={handleReset}><X className="w-4 h-4" /><span className="hidden sm:inline">Annuler</span></Button>}<Button size="sm" onClick={handleSave} disabled={dirtyCount === 0} className="flex-1 sm:flex-none bg-secondaire-600 hover:bg-secondaire-700"><Save className="w-4 h-4" />Enregistrer</Button></div>
      </div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMessage}</div>}
      <div className="lg:hidden space-y-3">{products.map(p => <EditableCard key={p.id} product={p} />)}</div>
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100"><div className="overflow-x-auto rounded-xl"><table className="w-full"><thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Prix</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Stock</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Illimité</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Disponible</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{products.map(product => { const row = editableRows[product.id]; if (!row) return null; return (
          <tr key={product.id} className={`transition-colors ${row.isDirty ? "bg-amber-50" : "hover:bg-gray-50"}`}>
            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0"><Image src={product.imageUrl || "/images/ingredients.jpg"} alt={product.name} width={40} height={40} className="w-full h-full object-cover" /></div><div><div className="flex items-center gap-2"><span className="font-medium text-gray-900 text-sm">{product.name}</span>{product.isOrganic && <Leaf className="w-3 h-3 text-green-600" />}{product.isLocal && <MapPin className="w-3 h-3 text-blue-600" />}</div><span className="text-xs text-gray-500">Base: {product.basePrice.toFixed(2)}€/{product.unit}</span></div></div></td>
            <td className="px-4 py-3"><Badge className={`text-xs ${categoryColors[product.category.slug] || "bg-gray-100 text-gray-800"}`}>{product.category.name}</Badge></td>
            <td className="px-4 py-3"><div className="flex items-center gap-1"><Input type="number" step="0.01" min="0" value={row.price} onChange={e => handleFieldChange(product.id, "price", e.target.value)} onBlur={e => handleFieldChange(product.id, "price", parseFloat(e.target.value).toFixed(2))} className="w-24 h-8 text-sm" /><span className="text-xs text-gray-500">€</span></div></td>
            <td className="px-4 py-3"><div className="flex items-center gap-1">{row.isUnlimited ? <div className="flex items-center gap-1 text-gray-400 h-8 px-2"><InfinityIcon className="w-4 h-4" /></div> : <Input type="number" min="0" value={row.quantity} onChange={e => handleFieldChange(product.id, "quantity", e.target.value)} className="w-20 h-8 text-sm" />}{!row.isUnlimited && <span className="text-xs text-gray-500">{product.unit}</span>}</div></td>
            <td className="px-4 py-3 text-center"><Checkbox checked={row.isUnlimited} onCheckedChange={c => handleFieldChange(product.id, "isUnlimited", !!c)} /></td>
            <td className="px-4 py-3 text-center"><Checkbox checked={row.isAvailable} onCheckedChange={c => handleFieldChange(product.id, "isAvailable", !!c)} /></td>
          </tr>); })}</tbody></table></div></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SECTION: Mon étal (main wrapper)
// ══════════════════════════════════════════════════════

function SectionEtal({ products, setProducts }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q)); }
    if (selectedCategory) result = result.filter(p => p.category.id === selectedCategory);
    if (selectedStatus === "active") result = result.filter(p => p.isActive);
    else if (selectedStatus === "inactive") result = result.filter(p => !p.isActive);
    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleEdit = (p: Product) => { setEditingProduct(p); setFormOpen(true); };
  const handleDelete = (id: string) => { if (!confirm("Supprimer ce produit ?")) return; setProducts(prev => prev.filter(p => p.id !== id)); };
  const handleDuplicate = (p: Product) => { setProducts(prev => [{ ...p, id: generateId(), name: `${p.name} (copie)`, pricesByMarket: p.pricesByMarket.map(x => ({ ...x, id: generateId() })), stocksByMarket: p.stocksByMarket.map(x => ({ ...x, id: generateId() })) }, ...prev]); };
  const handleSaveProduct = (p: Product) => { setProducts(prev => { const exists = prev.find(x => x.id === p.id); return exists ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev]; }); };
  const handleProductsChange = (updated: Product[]) => { setProducts(prev => prev.map(p => { const u = updated.find(x => x.id === p.id); return u || p; })); };
  const clearFilters = () => { setSearchQuery(""); setSelectedCategory(null); setSelectedStatus(null); };
  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondaire-100 rounded-lg"><Carrot className="w-6 h-6 text-secondaire-600" /></div>
          <div><h1 className="text-3xl font-bold text-secondaire-800">Mon étal</h1><p className="text-gray-600">{products.length} produit{products.length > 1 ? "s" : ""}</p></div>
        </div>
        <Button className="bg-secondaire-600 hover:bg-secondaire-700" onClick={() => { setEditingProduct(null); setFormOpen(true); }}><Plus className="w-4 h-4" /><span className="hidden sm:inline">Ajouter un produit</span><span className="sm:hidden">Ajouter</span></Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2"><Store className="w-5 h-5 text-secondaire-600 shrink-0" /><span className="text-sm font-medium text-gray-700 hidden sm:inline">Vue par marché :</span></div>
          <div className="flex items-center gap-2 flex-1">
            <Select value={selectedMarket} onValueChange={setSelectedMarket}><SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les marchés (synthèse)</SelectItem>{DEMO_MARKETS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent></Select>
            {selectedMarket !== "all" && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded whitespace-nowrap">Mode édition</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input type="text" placeholder="Rechercher un produit..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-gray-100" : ""}><Filter className="w-4 h-4" />Filtres{hasActiveFilters && <span className="ml-1 w-2 h-2 bg-secondaire-600 rounded-full" />}</Button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
            <select value={selectedCategory || ""} onChange={e => setSelectedCategory(e.target.value || null)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500"><option value="">Toutes les catégories</option>{DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={selectedStatus || ""} onChange={e => setSelectedStatus(e.target.value || null)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondaire-500"><option value="">Tous les statuts</option><option value="active">Actif</option><option value="inactive">Inactif</option></select>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4" />Réinitialiser</Button>}
          </div>
        )}
      </div>

      {selectedMarket === "all" ? (
        <DemoProductsTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      ) : (
        <DemoProductsTableEditable products={filteredProducts} marketId={selectedMarket} marketName={DEMO_MARKETS.find(m => m.id === selectedMarket)?.name || ""} onProductsChange={handleProductsChange} />
      )}

      <DemoProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} onSave={handleSaveProduct} />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════

export function VendorDashboardDemo() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notifCount = 2; // fake unread count

  return (
    <div className="flex min-h-[80vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 my-6 mx-auto max-w-[1400px]">
      {/* Mobile hamburger */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-secondaire-800 text-white rounded-lg shadow-lg" aria-label="Menu">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-secondaire-800 text-white flex flex-col shrink-0 fixed lg:sticky top-0 left-0 h-screen lg:h-auto lg:min-h-[80vh] z-50 lg:z-auto transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-secondaire-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondaire-600 flex items-center justify-center"><Store className="w-5 h-5" /></div>
              <div><h2 className="font-bold">La Ferme de Jean</h2><p className="text-xs text-secondaire-300">Mode démo</p></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-secondaire-700 rounded"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {sidebarMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${activeSection === item.id ? "bg-secondaire-600 text-white" : "text-secondaire-200 hover:bg-secondaire-700 hover:text-white"}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "notifications" && notifCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{notifCount}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-secondaire-700">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-secondaire-200 opacity-50 cursor-not-allowed text-sm">
            <Phone className="w-5 h-5 shrink-0" /><span>Support</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        {/* Demo banner */}
        <div className="mb-6 bg-gradient-to-r from-secondaire-50 to-amber-50 border border-secondaire-200 rounded-xl p-4">
          <h2 className="font-semibold text-secondaire-800">Mode démonstration</h2>
          <p className="text-sm text-secondaire-600 mt-0.5">Explorez le tableau de bord vendeur librement. Toutes les données sont fictives et les modifications restent en local.</p>
        </div>

        {activeSection === "dashboard" && <SectionDashboard productCount={products.length} />}
        {activeSection === "profil" && <SectionProfil />}
        {activeSection === "vitrine" && <SectionVitrine />}
        {activeSection === "marches" && <SectionMarches />}
        {activeSection === "etal" && <SectionEtal products={products} setProducts={setProducts} />}
        {activeSection === "commandes" && <SectionCommandes />}
        {activeSection === "facturations" && <SectionFacturations />}
        {activeSection === "notifications" && <SectionNotifications />}
        {activeSection === "parametres" && <SectionParametres />}
      </main>
    </div>
  );
}
