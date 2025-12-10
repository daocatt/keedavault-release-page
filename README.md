# KeedaVault Release System

A modern, secure, and open-source changelog manager built with React and Google Gemini.

## Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   API_KEY=your_google_ai_studio_api_key
   ```

3. **Run Dev Server**
   ```bash
   npm run dev
   ```

## Deployment

### Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Import the project into Vercel.
3. Vercel will automatically detect Vite.
4. **Important**: Add your `API_KEY` in the **Environment Variables** section of the Vercel Project Settings.
5. Deploy!

### Cloudflare Pages

1. Push your code to a Git repository.
2. Log in to Cloudflare Dashboard > Pages.
3. Connect your Git repository.
4. Use the following build settings:
   - **Framework Preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add your `API_KEY` in **Settings > Environment variables**.
6. Save and Deploy.

## Release Management

### Automatic Release Scanning

The project automatically scans the `releases/` folder for markdown files that comply with the markdownParser standards. Compliant files are automatically added to `releases/list.json` when running `npm run dev` or `npm run build`.

#### Release File Format

Release files must follow this format:

```markdown
---
version: 0.1.1
date: 2025-12-11
title: UPDATE
description: A modern, secure, and open-source password manager...
isBreaking: false
author_name: KD
author_avatar: /assets/logo.svg
---

- [FEATURE] Description of new feature
- [FIX] Description of bug fix
- [IMPROVE] Description of improvement
> Additional details for the improvement
```

#### Valid Change Types

- `[FEATURE]` - New features
- `[FIX]` - Bug fixes
- `[IMPROVE]` - Improvements and enhancements
- `[SEC]` - Security updates
- `[DEP]` - Deprecated features

#### Manual Release Update

You can manually update the release list:

```bash
npm run update-releases
```

This will scan all `.md` files in the `releases/` folder and update `list.json` with compliant files only.
