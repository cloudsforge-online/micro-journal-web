# syntax=docker/dockerfile:1
#
# Two stages: build the pages, then serve them. The final image contains no Node, no toolchain, no
# source and no secret — this surface is static files, and everything else in the image is attack
# surface for something it does not need to do.
#
# THE IMAGE CARRIES NO ENVIRONMENT, AND HERE THAT IS LITERAL RATHER THAN ASPIRATIONAL. Every other
# frontend in the estate says this and then spends a paragraph on the one host it resolves in the
# browser instead of baking. This one has no API at all: `src/lib/hosts.ts` exports no `apiBase`,
# nothing on any page is fetched, nothing is gated, and `test/shared-chrome.test.ts` asserts the
# absence. The bundle reads its own address only to compose links to the rest of the estate and to
# decide which network the switch is pointing at.
#
# THE ABSOLUTE URLs ARE NOT BAKED EITHER, WHICH IS THE RULE PARTICULAR TO THIS SURFACE. A canonical
# tag, an og:image and a sitemap must all be absolute — a relative og:image is dropped by most link
# unfurlers, so it is not a style preference. They are written to disk as the literal string
# `__CF_ORIGIN__` and substituted per request by `sub_filter` in nginx.conf, so ONE image serves
# journal.cloudsforge.online and journal-testnet.cloudsforge.online and a laptop, each telling a
# crawler the truth about where it was fetched from. `test/prerender.test.ts` greps every written
# file for a hostname and fails if one appears; the failure it is guarding against — a build arg for
# the origin — de-indexes the whole archive in favour of an estate its readers were never on.

# The named context is the unpublished @cloudsforge/ui workspace, mirroring the `link:` specifier in
# package.json. It disappears when the package is published; see the README.
#   docker build -t journal-web --build-context uipkg=../ui .

FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

# The linked package must exist before `pnpm install` resolves the `link:` dependency, and it is
# copied first because it changes far less often than this app's source.
COPY --from=uipkg packages/ui /ui/packages/ui
# esbuild reads the nearest tsconfig for each file it transforms, and the design system's extends the
# one at its repository root. Without it the build fails inside a file this app does not own.
COPY --from=uipkg tsconfig.base.json /ui/tsconfig.base.json

# pnpm-workspace.yaml carries the esbuild build-script allowance; without it the toolchain installs
# and then cannot run.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

# ══════════════════════════════════════════════════════════════════════════════════════════════
# scripts/ — THE HALF OF THE BUILD THAT IS NOT vite, AND THE LINE THIS FILE WAS MISSING.
#
# `pnpm build` is `vite build && node … scripts/prerender.ts`. The first half emits the bundle; the
# second walks `pageEntries()`, renders each address through `StaticRouter`, splices the result into
# vite's shell and writes a real file — plus feed.xml, sitemap.xml and robots.txt. Copied from the
# web template, this Dockerfile carried tsconfig, vite.config, index.html, src and public, which is
# the complete set for every OTHER frontend and one directory short for this one.
#
# The failure is loud (the RUN below exits non-zero) and that is luck rather than design. What it
# would produce if it were quiet is the thing worth naming: an image whose `dist` is a single
# `index.html` shell, served by an nginx.conf whose entire route table is
# `try_files $uri $uri/index.html =404`. Entering at `/` and clicking around works perfectly,
# because the client router is doing it. Every arrival from a search result, a shared link or a feed
# reader — which is every arrival this surface exists for — gets a 404, and a crawler sees an empty
# root div and indexes nothing at all.
# ══════════════════════════════════════════════════════════════════════════════════════════════
COPY scripts ./scripts

# ══════════════════════════════════════════════════════════════════════════════════════════════
# public/ — THE LINE THAT ONCE WAS NOT IN THE TEMPLATE.
#
# Vite copies `publicDir` into `dist` during the build, so the favicons and the og cards only reach
# the image if they are in the build context. The web template's Dockerfile used to copy tsconfig,
# vite.config, index.html and src — and not public — so every frontend cut from it built an image
# whose `dist/` had no favicon in it, while `brand-chrome.test.ts` went on passing because it reads
# the SOURCE tree. Four frontends shipped that way: icons wired, committed, tested, and absent from
# the artefact actually served.
#
# On this surface the directory holds more than chrome. Each article's hero and its 1200x630 card
# live under `public/articles/<slug>/`, and the card is the picture in every link preview the
# article will ever get — an og:image that 404s is a grey box in Slack and on LinkedIn for as long
# as the URL is shared, which for an article is years.
# ══════════════════════════════════════════════════════════════════════════════════════════════
COPY public ./public

# The release identity: the git sha, stamped into the meta tag src/lib/obs.ts reads, so an error
# report names the deploy that produced it. It identifies the artefact; it does not configure it.
ARG RELEASE=dev
RUN sed -i "s|name=\"cf-release\" content=\"dev\"|name=\"cf-release\" content=\"${RELEASE}\"|" index.html \
 && pnpm build

# nginx-unprivileged: the server runs as uid 101 and listens on 8080. A static file server has no
# reason to be root, and a container that cannot become root cannot be made to write anywhere.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

# ══════════════════════════════════════════════════════════════════════════════════════════════
# THERE IS NO nginx TEMPLATE AND NO RUNTIME ENVIRONMENT VARIABLE IN THIS IMAGE, AND ON THIS SURFACE
# THAT IS A STRONGER CLAIM THAN IT LOOKS, BECAUSE nginx IS DOING REAL WORK HERE.
#
# pool-web ships `deployment.inc.template` and `ENV POOL_API_PRESENCE`, expanded by the stock
# entrypoint at container start, because it has one fact it cannot work out for itself: whether a
# micro-pool exists behind this hostname at all on this estate (micro-org#406).
#
# This surface has no such fact, and yet its nginx.conf is the longest in the estate — because it
# rewrites the response body on the way out (`sub_filter` replacing `__CF_ORIGIN__` with
# `https://$host`) and decides from `$host` alone whether this hostname is the canonical one. Both
# are derived from the request. Neither needs a variable, and a variable would be WORSE than the
# derivation: an estate flag saying "this is mainnet" can be wrong on the container it is set on,
# whereas `$host` is what the reader actually typed.
#
# The one consequence to keep in view is that `gzip_static` must stay out of nginx.conf. A
# pre-compressed file is passed through untouched, so it would ship every canonical URL to the
# crawlers that accept gzip — which is all of them — with the placeholder still in it.
# `test/seo.test.ts` fails if the directive appears.
# ══════════════════════════════════════════════════════════════════════════════════════════════

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Liveness only. It proves nginx is answering, not that the archive is in the image — a container
# whose `dist` held nothing but the shell would answer this probe green forever. What proves the
# pages exist is `test/prerender.test.ts` before the image is built and the image probe in ci.yml
# after, which fetches an article by its own address and greps the response for its own headline.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
