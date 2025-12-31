# LexiLearn Vocabulary App

This is a Next.js-based vocabulary learning application, designed to be deployed on GitHub Pages.

## How to Deploy to GitHub Pages

Follow these steps to get your application live.

### Step 1: Update Configuration Files

1.  **`package.json`**:
    *   Open the `package.json` file.
    *   Find the `homepage` field.
    *   Replace `<your-github-username>` with your actual GitHub username.
    *   The final URL should look like this: `"homepage": "https://yourusername.github.io/lexilearn"`

2.  **`next.config.ts`**:
    *   Open the `next.config.ts` file.
    *   At the top of the file, find the constant `REPO_NAME`.
    *   If your GitHub repository name is different from `lexilearn`, update the value of `REPO_NAME` to match your repository name.

### Step 2: Push Your Code to GitHub

Make sure your local code is committed and pushed to the `main` (or `master`) branch of your GitHub repository.

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

### Step 3: Run the Deployment Script

Once your code is on GitHub, run the following command in your local terminal:

```bash
npm run deploy
```

This command will:
1.  Build the static version of your Next.js application into the `out` directory.
2.  Use the `gh-pages` package to push the contents of the `out` directory to a special branch in your repository called `gh-pages`.

### Step 4: Configure GitHub Repository Settings

1.  Go to your repository on GitHub.
2.  Click on the **Settings** tab.
3.  In the left sidebar, click on **Pages**.
4.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
5.  Under "Branch", select `gh-pages` as the source branch and `/ (root)` for the folder.
6.  Click **Save**.

GitHub will now publish your site from the `gh-pages` branch. It might take a few minutes for the site to become live. Your site will be available at the URL you specified in the `homepage` field of your `package.json` file.

That's it! Your LexiLearn application is now live on GitHub Pages.
