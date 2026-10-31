# Manoeuvre Infra — website source

Complete source export of the published website, dated 30 October 2026.
Source revision: bc9441cfc9ce438fca7eb7a77e135f27a44bd273.

## Run locally

1. Extract the ZIP and open this folder in your editor or terminal.
2. Use Node.js 22 or newer (with npm).
3. Run:

   ```sh
   npm run dev
   ```

4. Open http://127.0.0.1:4173/ in a browser. Press Ctrl+C to stop the server.

No npm packages need to be installed. The local preview uses Node's built-in
modules; Three.js and its license are included in `dist/vendor`.
If port 4173 is already occupied, use a different port in PowerShell:

```powershell
$env:PORT = '4174'
npm run dev
```

After editing source files, run `npm run build`, then refresh the browser.
The preview does not watch source files or automatically rebuild them.
`npm start` serves the existing `dist` folder without rebuilding.

## What to edit

| File | Purpose |
| --- | --- |
| `src/templates.mjs` | Page layouts, header, footer, hero sections and content |
| `src/data.mjs` | Projects, accomplished projects and track record |
| `src/v2.css` | Active responsive styles and animation styles |
| `src/v2.js` | Active menus, filters, search, reveals and contact interactions |
| `src/scene.js` | Three.js home hero, rotating logo and construction animation |
| `dist/assets/` | Images, logos and artwork used by the site |
| `build.mjs` | Generates HTML and copies active CSS/JavaScript into `dist` |
| `scripts/serve.mjs` | Dependency-free local preview server |

`src/styles.css` and `src/app.js` are older source files retained in this complete
export; the current build uses `src/v2.css` and `src/v2.js` instead.

Keep `dist/assets`, `dist/vendor`, `dist/favicon.svg` and `dist/robots.txt`.
The build preserves these files; they are not regenerated from source. Do not
delete the entire `dist` directory before building.

## Pages and behavior

- Home, About, Projects, Safety, Track record and Contact are individual pages.
- Projects show their details inside cards. Old project detail URLs redirect to
  the corresponding project card on the Projects page.
- The contact form opens a composed message in the visitor's email app. It does
  not submit to an email backend or database.
- Google Fonts are loaded online; system font fallbacks are included in the CSS.
- Project/company images include original supplied assets, developer imagery and
  generated illustrative artwork. Existing attribution and alt text are retained.
- The Three.js license is in `dist/vendor/LICENSE`.

## Build and deploy

```sh
npm run build
```

Upload the contents of `dist` to the root of your static website hosting, or
configure a Git-based static host with build command `npm run build` and output
directory `dist`. Routes use individual `index.html` files in folders; they do
not need a single-page-app catch-all rewrite. Serve the site from the domain
root, because asset and page links start with `/`.

The `dist` folder is already built and can be uploaded directly. This portable
export excludes Git history and the original hosting account configuration.
It does not require a GitHub connection or the original hosting account to run.

### Vercel deployment

The root `vercel.json` sets the build command to `npm run build` and the output
directory to `dist`, using the Other framework preset.

For the existing `manoeuvre-infra` Vercel project, connect the Git repository
`prathamxxh999-code/manoeuvre-infra`, use the repository root as the Root Directory,
and use `main` as the production branch. Deploy the latest commit from that branch
to update `https://manoeuvre-infra.vercel.app`. Redeploying an older deployment
without selecting the latest source can preserve the older project figures.

The corrected Leaf project figures are **18 acres** and **7.5 lakh sq ft**.
Confirm them on `/projects` after production deployment.

Configuration reference: https://vercel.com/docs/project-configuration/vercel-json
