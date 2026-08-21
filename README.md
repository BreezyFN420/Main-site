# Main-site

## Owner editing setup

The profile includes an owner-only GitHub OAuth editor at `/api/auth/github`. The frontend does not contain a password or GitHub secret.

For Cloudflare Pages, set the project root to this repository, leave the build command empty, and use `.` as the build output directory. Do not use `npx wrangler deploy`; that is the Worker deploy command and will fail for a Pages project. If a deploy command is required, use `npx wrangler pages deploy . --project-name kvpll`.

Add these encrypted environment variables and deploy the `functions/` directory with the Pages project:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI` (for example, `https://your-domain.example/api/auth/callback`)
- `SESSION_SECRET` (long random value)
- `GITHUB_REPO_OWNER` (`BreezyFN420`)
- `GITHUB_REPO_NAME` (`Main-site`)

Create a GitHub OAuth App with the callback URL matching `GITHUB_REDIRECT_URI`. The OAuth app needs the `read:user` and `repo` scopes. The editor only authorizes the GitHub login `BreezyFN420`; it does not accept a browser-side password.