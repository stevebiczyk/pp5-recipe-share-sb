# Development and verification

Use Node.js 20 or later. From this directory:

```powershell
npm.cmd ci
Copy-Item .env.example .env.development
npm.cmd run dev
```

Only copy the environment example when creating the configuration for the first time; preserve existing local settings. Set `VITE_API_URL=http://127.0.0.1:8000` for the local backend. In development, when the browser and API use local loopback hostnames, the client sends API requests through Vite's `/api/` proxy. This keeps cookies on the browser's origin whether you open `http://localhost:3000` or `http://127.0.0.1:3000`. The proxy also forwards `/media/` for local avatars. Run the backend separately using its `DEVELOPMENT.md` instructions.

Restart Vite after proxy/environment changes, reload the browser and log in again. Existing cookies from direct requests to the other hostname will not authenticate the new same-origin route. Keep `VITE_API_URL` as the backend address; do not change it to the frontend's `/api/` URL. Absolute pagination URLs returned by the local API are routed back through the proxy. Production builds continue to use the configured API URL directly; the development proxy is not a production server.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd exec -- serve -s build
```

Vitest runs the React tests in jsdom. MSW intercepts API calls; tests do not use a live database or server. The API client tests cover CSRF bootstrap, session restoration, shared refresh for concurrent requests, and refresh failure. UI tests cover network errors, vote switching/removal, auth redirects, and search encoding/stale results.

The production `Procfile` uses the declared `serve` dependency to serve `build/`, including fallback for client-side routes. Set `VITE_API_URL` before the production build; Vite embeds it in the bundle. Production cookie/origin settings are documented in the backend's `DEVELOPMENT.md` and still need checking in the deployed browser environment.

Router 7 uses the existing declarative `BrowserRouter`/`Routes` arrangement. The production server's compression dependency is overridden to the patched 1.8 series. Use `npm.cmd ci` with the committed lockfile for repeatable installs.
