# LexiLearn Vocabulary App

This is a Next.js-based vocabulary learning application, designed to be deployed on GitHub Pages.

## How to Deploy to GitHub Pages

Follow these steps to get your application live.

### Step 1: Update Configuration Files (I have already done this for you)

1.  **`next.config.mjs`**:
    *   The configuration has been updated for static export (`output: 'export'`), including `trailingSlash: true`.
    *   `basePath` and `assetPrefix` have been set to your repository name (`/LexiLearn09672`).
    *   PWA settings have been integrated correctly.

### Step 2: Push Your Code to GitHub

Make sure your local code is committed and pushed to the `main` branch of your GitHub repository.

Run these commands in your terminal:

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

### Step 3: Run the Deployment Script

Once your code is on GitHub, run the following command in your local terminal. This command will build your application and push it to the `gh-pages` branch on GitHub.

```bash
npm run deploy
```

### Step 4: Configure GitHub Repository Settings

1.  Go to your repository on GitHub: `https://github.com/Ashik241/LexiLearn09672`
2.  Click on the **Settings** tab.
3.  In the left sidebar, click on **Pages**.
4.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
5.  Under "Branch", select `gh-pages` as the source branch and `/ (root)` for the folder.
6.  Click **Save**.

GitHub will now publish your site from the `gh-pages` branch. It might take a few minutes for the site to become live. Your site will be available at: **https://Ashik241.github.io/LexiLearn09672**

That's it! Your LexiLearn application is now live on GitHub Pages.
