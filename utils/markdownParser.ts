import { Release, ChangeType, ChangeItem } from '../types';

export const parseReleaseMarkdown = (markdown: string): Release | null => {
  try {
    // 1. Extract Frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontmatterRegex);

    if (!match) {
      console.error("No frontmatter found in markdown");
      return null;
    }

    const frontmatterRaw = match[1];
    const contentRaw = markdown.replace(frontmatterRegex, '').trim();

    // 2. Parse Frontmatter (Simple Key-Value parser)
    const metadata: Record<string, string> = {};
    frontmatterRaw.split('\n').forEach(line => {
      const [key, ...values] = line.split(':');
      if (key && values.length) {
        metadata[key.trim()] = values.join(':').trim();
      }
    });

    // 3. Parse Body (Changes)
    // Format expectation:
    // - [TYPE] Description
    //   > Details (optional)
    
    const changes: ChangeItem[] = [];
    const lines = contentRaw.split('\n');
    let currentChange: ChangeItem | null = null;

    lines.forEach(line => {
      const changeMatch = line.match(/^- \[(.*?)\] (.*)/);
      
      if (changeMatch) {
        // Save previous change if exists
        if (currentChange) {
          changes.push(currentChange);
        }

        // Start new change
        const typeStr = changeMatch[1].toUpperCase();
        const description = changeMatch[2].trim();
        
        // Map string to ChangeType enum
        let type = ChangeType.Feature;
        if (Object.values(ChangeType).includes(typeStr as ChangeType)) {
          type = typeStr as ChangeType;
        } else {
             // Fallback mapping for simplified text
             if (typeStr === 'FEAT') type = ChangeType.Feature;
             if (typeStr === 'FIX') type = ChangeType.BugFix;
             if (typeStr === 'IMPROVE') type = ChangeType.Improvement;
             if (typeStr === 'SEC') type = ChangeType.Security;
             if (typeStr === 'DEP') type = ChangeType.Deprecated;
        }

        currentChange = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          description,
          details: ''
        };
      } else if (currentChange && line.trim().startsWith('>')) {
        // Append details
        const detailLine = line.trim().substring(1).trim();
        currentChange.details = currentChange.details 
          ? currentChange.details + '\n' + detailLine 
          : detailLine;
      } else if (currentChange && line.trim() === '') {
        // details usually continue, but we can treat empty lines as separators if needed
        // For now, ignore empty lines inside details or handle multiline blocks
        if (currentChange.details) {
            currentChange.details += '\n';
        }
      }
    });

    // Push last change
    if (currentChange) {
      changes.push(currentChange);
    }

    return {
      version: metadata.version || '0.0.0',
      date: metadata.date || new Date().toISOString(),
      title: metadata.title || 'Untitled Release',
      description: metadata.description || '',
      isBreaking: metadata.isBreaking === 'true',
      author: {
        name: metadata.author_name || 'Unknown',
        // Use local default asset if no avatar is provided in frontmatter
        avatar: metadata.author_avatar || 'assets/default-avatar.svg',
      },
      changes
    };

  } catch (e) {
    console.error("Failed to parse release markdown", e);
    return null;
  }
};