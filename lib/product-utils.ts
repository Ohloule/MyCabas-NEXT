// Utilitaires partagés pour la gestion des produits

export const VALID_UNITS = ["kg", "g", "litre", "piece", "botte", "lot", "barquette"];
export const CONTINUOUS_UNITS = ["kg", "g", "litre"];

// Traduire un texte FR → EN via MyMemory (gratuit, sans clé)
export async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    const translated = data.responseData?.translatedText?.trim();
    return translated || text;
  } catch {
    return text;
  }
}

// Récupérer la première image Unsplash correspondant à une requête
export async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&content_filter=high&orientation=squarish`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { urls?: { small?: string } }[];
    };
    return data.results?.[0]?.urls?.small ?? null;
  } catch {
    return null;
  }
}
