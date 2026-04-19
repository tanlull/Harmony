# Harmony Deployment Guide

This project is a static site. The cleanest way to deploy it on the same server as `DataAnalytics4Level` is:

- keep `dms.totbb.net` on the existing Next.js app at `127.0.0.1:3000`
- serve `HarmonyHatyai.com` as static files from a separate folder
- let `Caddy` route requests by domain name

That avoids conflicts with the existing app's:

- PM2 process
- app port
- database
- environment file
- deployment directory

## Target layout on `203.113.70.195`

Use a separate directory tree for Harmony:

```bash
sudo mkdir -p /var/www/harmonyhatyai/releases
sudo mkdir -p /var/www/harmonyhatyai/shared
sudo chown -R edocpmtadmin:edocpmtadmin /var/www/harmonyhatyai
```

This workflow publishes each deploy to:

- `/var/www/harmonyhatyai/releases/<git-sha>`

and updates:

- `/var/www/harmonyhatyai/current`

to point at the newest release.

## Caddy configuration

Edit `/etc/caddy/Caddyfile` so both sites live side by side:

```caddy
dms.totbb.net {
    reverse_proxy 127.0.0.1:3000
    encode gzip zstd
}

harmonyhatyai.com, www.harmonyhatyai.com {
    root * /var/www/harmonyhatyai/current
    file_server
    encode gzip zstd
}
```

Then reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## DNS

Point both records to the same server IP:

- `A` record for `@` -> `203.113.70.195`
- `A` record for `www` -> `203.113.70.195`

Caddy will provision HTTPS certificates automatically after DNS is live.

## GitHub Actions runner

Your existing `DataAnalytics4Level` deployment appears to use a repository-level self-hosted runner. If so, this Harmony repo needs its own runner registration on the same server, or you need to move to an organization-level runner.

Safest option: add a second runner service on the same machine for this repository.

Example outline:

```bash
mkdir -p ~/actions-runner-harmony
cd ~/actions-runner-harmony
# download the runner package from GitHub for this repo
./config.sh --url https://github.com/<owner>/Harmony --token <runner-token>
sudo ./svc.sh install edocpmtadmin
sudo ./svc.sh start
```

## Required sudo permissions

The workflow runs:

- `sudo caddy validate --config /etc/caddy/Caddyfile`
- `sudo systemctl reload caddy`

So the runner user must be allowed to run those without an interactive password prompt.

Recommended `sudoers` entry via `sudo visudo`:

```sudoers
edocpmtadmin ALL=NOPASSWD: /usr/bin/caddy validate --config /etc/caddy/Caddyfile
edocpmtadmin ALL=NOPASSWD: /bin/systemctl reload caddy
```

You may need to adjust paths if `which caddy` or `which systemctl` return different locations.

## Workflow behavior

The workflow in `.github/workflows/deploy.yml`:

1. checks out the repo on the self-hosted runner
2. copies the static site to `/var/www/harmonyhatyai/releases/$GITHUB_SHA`
3. updates `/var/www/harmonyhatyai/current`
4. validates the Caddy config
5. reloads Caddy

## Notes

- No PM2 is needed for Harmony.
- No extra port is needed for Harmony.
- No Node build step is needed because this repo is plain HTML/CSS/JS.
- This setup will not interfere with `DataAnalytics4Level` as long as its site stays on `127.0.0.1:3000`.
