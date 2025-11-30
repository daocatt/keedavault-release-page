import { Release } from '../types';
import { parseReleaseMarkdown } from '../utils/markdownParser';

export const loadStaticReleases = async (): Promise<Release[]> => {
  try {
    // 1. Fetch the manifest list
    const listResponse = await fetch('releases/list.json');
    if (!listResponse.ok) {
      throw new Error(`Failed to load release manifest: ${listResponse.statusText}`);
    }
    const files: string[] = await listResponse.json();

    // 2. Fetch all markdown files in parallel
    const releasePromises = files.map(async (filename) => {
      const res = await fetch(filename);
      if (!res.ok) {
        console.warn(`Failed to fetch release file: ${filename}`);
        return null;
      }
      const text = await res.text();
      return parseReleaseMarkdown(text);
    });

    const results = await Promise.all(releasePromises);

    // 3. Filter out failures and sort by date descending
    const releases = results.filter((r): r is Release => r !== null);
    
    return releases.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  } catch (error) {
    console.error("Error loading static releases:", error);
    return [];
  }
};