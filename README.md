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

## Notes

- This project relies on static markdown files in `releases/`. The build configuration copies these to the output directory so the app can fetch them at runtime.
