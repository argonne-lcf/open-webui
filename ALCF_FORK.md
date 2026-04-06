# ALCF Fork (aurora-gpt): Maintainer's Guide

This is a fork of [Open WebUI](https://github.com/open-webui/open-webui) that:

1. **Signs users in with Globus** and stores their Globus access token (for the ALCF Inference Service) as their Open WebUI API key.
2. **Lists only the ALCF models each user is allowed to use**, with live/starting/queued/offline status. Model calls are sent with the user's own Globus token.

The fork is kept as a small stack of commits rebased onto `upstream/main`.

---

## Design decisions

These principles shape every fork change. Keep them when resolving conflicts or adding features.

### 1. The Inference Gateway is the source of truth for access
Open WebUI decides neither who may use the service nor which models they see; the ALCF Inference Gateway does. The fork only relays the user's Globus token and acts on the gateway's answers:
- **Who may log in:** the gateway's `whoami` endpoint, plus two local guards (`AUTHORIZED_IDP_DOMAINS`, `AUTHORIZED_GROUPS_PER_IDP`).
- **Which models a user sees:** the gateway's `list-endpoints`, called with that user's token.
- **Whether a request succeeds:** the gateway, which receives the user's token on every inference call.

Open WebUI's own roles, groups and model access control still apply on top, but they can only narrow access, never widen it.

### 2. Every inference call carries the user's own token
There is no shared service key. For chat, embeddings, responses and the proxy, the connection's configured key is replaced with the user's stored Globus token. The gateway can therefore enforce per-user quotas and permissions, and audit logs show real identities. The admin-configured key on an AuroraGPT connection is effectively unused.

### 3. A user sees the intersection of what the admin configured and what the gateway allows
An AuroraGPT connection lists `model_ids` explicitly; the endpoint's `/models` is never queried. The list shown to a user is those ids, filtered to what `list-endpoints` returns for that user and cluster. This lets admins curate names and order, while the gateway keeps control of entitlement.

### 4. Fail closed
When in doubt, show less:
- Errors from `list-endpoints` produce an empty model list, not the unfiltered one.
- An authorization failure at login redirects to `/unauthorized` with the gateway's message; it never falls back to letting the user in.
- `AUTHORIZED_IDP_DOMAINS` is required, and the app refuses to start without it rather than run unrestricted.
- Upstream's per-connection raw model listing (`GET /openai/models/{url_idx}`) is disabled.

### 5. Private models stay private, across every cache
Model lists differ per user, so no cache or shared state may serve one user's list to another:
- `openai.get_all_models` is cached per user.
- Model-status caches are keyed by a hash of the token, never the token itself.
- The global `models.base_models_cache` setting must stay **off**.

### 6. Authorization runs wherever a token is issued
The Globus check happens after the OAuth token exchange, whichever path (including retries) produced the token. The token is stored only after it passes. It is refreshed in the `api_key` table on every login, so the stored token is always the most recent one.

### 7. Expired tokens mean re-login, not silent refresh
Tokens are never refreshed in the background. When the gateway returns 401 on `list-endpoints`:
- the backend raises `list_endpoints_unauthorized`;
- the frontend shows a blocking "Session Expired" dialog with no cancel option;
- confirming the dialog logs the user out through Globus.

With a high-assurance policy configured, login also forces a fresh Globus authentication (`prompt=login`). Inactive sessions are logged out automatically (60 min, warned 5 min ahead).

### 8. The UI reflects the reality of HPC-hosted models
Models on ALCF clusters may be cold, queued or starting, so the UI shows it plainly:
- **Status filter:** the model selector defaults to **Live**, so users first see models that can answer now. The other statuses are one click away.
- **Badges:** cluster badges (SOPHIA, METIS, …) appear wherever a model name does, because the same model can run on several clusters.
- **Status banner:** a banner warns when the selected model isn't live, and timeouts on non-live models get a specific message.
- **Clear button on errors:** a failed response can be cleared so the chat can continue.
- **Reduced parameters:** the advanced-params panel shows only parameters the inference service supports.

### 9. Globus is the only front door
The login page shows only "Continue with Globus". Password login is kept at `/oldauth` as an admin fallback. On signout, Globus users skip upstream's OIDC end-session flow and use Globus logout instead; upstream's token invalidation still runs for everyone.

### 10. Stay close to upstream
The fork is small and additive so rebases stay cheap:
- **New files over edits:** new behavior goes in new files where possible (`inference_auth_check.py`, `ModelStatusBanner.svelte`, `AdvancedParamsInferenceService.svelte`, `autoLogout.ts`, `/unauthorized`, `/oldauth`).
- **Small, labeled edits:** when an upstream file must change, the edit is small and wrapped in `[ADDITION BEGINS]/[ADDITION ENDS]` or `[MODIFICATION BEGINS]/[MODIFICATION ENDS]` markers, keeping the original line in a comment where useful.
- **Upstream's patterns:** fork features fit upstream's UI and code patterns rather than replacing them. AuroraGPT is an option in the Provider dropdown; status filters are entries in the existing model-filter dropdown; config is plain env values like upstream's.
- **Dependencies:** fork dependency pins are only security minimums. Upstream's lockfile decides actual versions; never pin below it.

---

## How it works

### Login (backend: `utils/oauth.py`, `utils/inference_auth_check.py`)
1. Globus is registered as an OAuth provider in `config.py → load_oauth_providers()`. When `GLOBUS_HIGH_ASSURANCE_POLICY` is set, login sends `session_required_policies` and `prompt=login`.
2. In `handle_callback`, the access token whose scope equals `GLOBUS_INFERENCE_SERVICE_SCOPE` is taken from `token["other_tokens"]`.
3. `validate_user_access_token()` calls the gateway's whoami endpoint and checks `AUTHORIZED_IDP_DOMAINS` and `AUTHORIZED_GROUPS_PER_IDP`. On failure the user is redirected to `/unauthorized?error=…`.
4. The token is saved to the `api_key` table: on user creation (`Auths.insert_new_auth(api_key=…)`) and on every later login (`Users.update_user_api_key_by_id`).
5. An `oauth_provider=globus` cookie is set and later read by signout.

### Model listing (backend: `routers/openai.py`)
- A connection is an "AuroraGPT" connection when its config has `aurora: true`, plus `cluster_name` and `model_status_url`. In the admin UI, pick **Provider → AuroraGPT**.
- `get_all_models_responses()`:
  - `get_allowed_model_ids()` filters the connection's `model_ids` through `ALCF_LIST_ENDPOINTS_URL`, using the user's token. A 401 from that API becomes `HTTPException(401, "list_endpoints_unauthorized")`.
  - For aurora connections the model list is built locally (`provider: "aurora"`, `cluster_name`).
  - `AGPTModelStatus` fetches statuses from `model_status_url` (1 s TTL, 5 s wait before returning cached data) and tags each model `live` / `starting` / `queued` / `offline`.
- `generate_chat_completion`, `embeddings`, `responses` and `proxy` swap in `Users.get_user_api_key_by_id(user.id)` as the key.

### Frontend
| Area | Files |
|---|---|
| Globus login page | `src/routes/auth/+page.svelte` |
| Unauthorized page / password-login fallback | `src/routes/unauthorized/`, `src/routes/oldauth/` |
| Session expired dialog → Globus logout | `src/routes/(app)/+layout.svelte` (`setModels` catch), `src/lib/apis/index.ts` (adds `status` to errors), `ConfirmDialog.svelte` (`showCancel`) |
| Auto-logout after inactivity | `src/lib/utils/autoLogout.ts`, wired in `src/routes/+layout.svelte`; see `docs/AUTO_LOGOUT.md` |
| Signout | `UserMenu.svelte` (`userOauthSignOut`), `src/lib/apis/auths/index.ts` |
| Status filter and cluster badges | `ModelSelector/Selector.svelte`, `ModelItem.svelte`, `PinnedModelItem.svelte`, `MessageInput.svelte`, `Commands/Models.svelte`, `ResponseMessage.svelte`, `MultiResponseMessages.svelte` |
| Model status banner | `chat/ModelStatusBanner.svelte` (used in `Placeholder.svelte`) |
| "Clear" button on errors | `Messages/Error.svelte`, `ResponseMessage.svelte` (`clearResponseError`) |
| Inference-service parameter panel | `AdvancedParamsInferenceService.svelte`, used by `Controls.svelte`, `Settings/General.svelte`, `workspace/Models/ModelEditor.svelte` (upstream's `AdvancedParams.svelte` is untouched and used only in admin screens) |
| AuroraGPT connection fields | `AddConnectionModal.svelte` |
| Branding | `src/app.css`, `static/static/*` and `backend/open_webui/static/*` (logos, `custom.css`), small CSS tweak in `layout/Sidebar.svelte` |

### Other backend touches
- `main.py`: `oauth.client_ids` in `/api/config` (the frontend needs the Globus client ID for logout), plus `/oauth/{provider}/token/revoke` and `/oauth/{provider}/signout` (see Known issues).
- `routers/auths.py → signout`: calls the Globus logout URL and skips the OIDC end-session logic for Globus users.
- `backend/start.sh`: adds `--ssl-keyfile/--ssl-certfile` when `SSL_CERTFILE` and `SSL_KEYFILE` point to existing files.
- `Dockerfile`: `NODE_OPTIONS=--max-old-space-size=4096`, `npm ci --force --legacy-peer-deps`.
- `uv.lock` is intentionally not tracked.

---

## Environment variables

| Variable | Notes |
|---|---|
| `GLOBUS_CLIENT_ID`, `GLOBUS_CLIENT_SECRET`, `GLOBUS_REDIRECT_URI` | Globus app; the provider is enabled only when the ID and secret are set |
| `GLOBUS_OAUTH_SCOPE` | Default `openid email profile`; must also request the inference scope |
| `GLOBUS_INFERENCE_SERVICE_SCOPE` | Scope of the token that gets stored and used |
| `GLOBUS_HIGH_ASSURANCE_POLICY` | Optional policy ID |
| `GATEWAY_API_WHOAMI_URL` | Inference Gateway whoami endpoint |
| `AUTHORIZED_IDP_DOMAINS` | **Required**: newline-separated list; the app refuses to start without it |
| `AUTHORIZED_GROUPS_PER_IDP` | JSON `{"domain": "uuid1,uuid2"}` |
| `ALCF_LIST_ENDPOINTS_URL` | Default `https://inference-api.alcf.anl.gov/resource_server/list-endpoints` |
| `SSL_CERTFILE`, `SSL_KEYFILE` | Optional, used by `start.sh` |

These are plain module-level values in `config.py` (no `.value`).

---

## Branches and commits

| Remote | Repo | Branch |
|---|---|---|
| `origin` | `argonne-lcf/open-webui` | `aurora-gpt` (the fork) |
| `upstream` | `open-webui/open-webui` | `main` |

There are four fork commits on top of upstream (`git log upstream/main..aurora-gpt`):

| Commit | Contents |
|---|---|
| Squash aurora-gpt fork changes | Globus auth, ALCF model listing and status, UI |
| Vulnerabilities patch | Dependency security minimums |
| Empty models fix | Session-expired flow |
| Disable unused workflows | Trimmed `docker-build.yaml`; Dockerfile install flags |

Based on upstream `91ea4e342` (v0.12.x) as of 2026-10-21. Some older edits are not wrapped in markers, so `git show <fork-commit> -- <file>` is the source of truth for what the fork changes in a file.

---

## Rebase procedure

```bash
git fetch upstream origin
git branch aurora-gpt-backup-$(date +%F) aurora-gpt   # always
git stash                                              # if dirty
git rebase upstream/main
```

For each conflicted file:
1. Run `git show <fork-commit> -- <file>` to see what the fork intends.
2. Usually it's easiest to **take upstream's side, then re-apply the fork's intent by hand** (fork hunks are small). Keep the markers.
3. Grep for the fork's symbols afterwards. Git can auto-merge fork code into code upstream has restructured, and the result compiles but is dead or wrong. Before re-adding a fork block by hand, check that git hasn't already merged it, or it ends up in the file twice.
4. Re-check the design decisions above, especially 4–6.

### Things to know about the current upstream codebase
- **Async backend:** model calls (`Users.*`, `Auths.*`) are `async` and must be awaited.
- **API keys:** they live in the `api_key` table (`Users.get/update_user_api_key_by_id`), not on the user row.
- **Connection config:** read it through `get_openai_connection(idx)` / `get_openai_runtime_config()`.
- **Persisted settings:** read them with `await Config.get('<key>')`, e.g. `webui.url`.
- **Signout:** it is `POST`.
- **`ConfirmDialog`:** it closes via `cancelHandler()` from Escape, the close shortcut, the backdrop and the button, and `showCancel` guards all four.
- **Model selector filters:** they are one dropdown (`modelFilterItems` / `setModelFilter`); status filters are `status:*` entries.
- **Auth redirects:** the redirect to `/auth` happens only in `src/routes/(app)/+layout.svelte`. `/unauthorized` and `/oldauth` sit outside `(app)`, so they never redirect.
- **Lockfile:** regenerate `package-lock.json` **without** `--legacy-peer-deps` (`npm install --package-lock-only --ignore-scripts`). Generating it with that flag drops peer packages such as `@internationalized/date` and breaks the build. The Dockerfile still installs with the flag.

### Verify before pushing
```bash
# Backend: no new undefined names compared with upstream
uvx ruff check --isolated --select F821,F811 backend/open_webui/{config,main}.py \
  backend/open_webui/routers/{openai,auths}.py backend/open_webui/utils/oauth.py \
  backend/open_webui/models/{users,auths}.py
# Frontend: same install as the Dockerfile, then build (use a git worktree to keep your node_modules)
npm ci --force --legacy-peer-deps && npx vite build
```
`svelte-check` reports thousands of errors that already exist upstream. Only compare it against an upstream baseline.

Then test by hand: Globus login (authorized and unauthorized identities), model list differs per user, status badges and filter, chat with an ALCF model, the expired-token dialog, signout, auto-logout.

Publishing needs `git push --force-with-lease origin aurora-gpt`.

---

## Known issues
- `handle_revoke` / `handle_signout` don't exist on `OAuthManager`, so `/oauth/{provider}/token/revoke` and `/signout` return 500. The frontend only calls `userOauthSignOut`; either implement them or delete the routes.
- `oauth.py` imports `authlib.jose` for the unused `ORCIDHandledToken` class. It is deprecated in authlib 1.7 and goes away in 2.0. Delete it when convenient.
- The fork's extra model fields (`provider`, `cluster_name`, `status`, message `hidden`) aren't in the TS types, so `svelte-check` shows type-only errors. They're harmless at runtime.
- Logos and `custom.css` are duplicated in `static/static/` and `backend/open_webui/static/`.
