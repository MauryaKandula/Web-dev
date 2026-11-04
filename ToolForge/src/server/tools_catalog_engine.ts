export interface CatalogTool {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'aesthetics' | 'utility' | 'development';
  price_inr: number;
  version: string;
  release_notes: string;
  download_filename: string;
  file_size_kb: number;
  sales_count: number;
  rating_avg: number;
  rating_count: number;
}

// The previous generated catalog represented third-party projects as ToolForge
// products without verified packages, licenses, ownership, or distribution rights.
// Keep these compatibility exports empty until every listing is reviewed and has
// an authentic package and permission to redistribute it.
export function generateAestheticsTools(): CatalogTool[] {
  return [];
}

export function generateUtilityTools(): CatalogTool[] {
  return [];
}

export function generateDevTools(): CatalogTool[] {
  return [];
}

export async function ingestTop100Tools(
  _onProgress?: (tool: CatalogTool, current: number, total: number) => void
): Promise<{ ingested: number; total: number }> {
  return { ingested: 0, total: 0 };
}
