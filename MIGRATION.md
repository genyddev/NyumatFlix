# Phase-one legal source cleanup

This document is the sole historical record of the removed streaming-aggregator implementation. The names and domains below are documentation only and are not imported, requested, rendered, or referenced by the application runtime.

## Removed provider implementations

- Movie and television providers: Bingr, Direct/CallUsPirates, Hexa, KissKH, VidEasy, VidKing, VidLink, VidNest, VidRock, VidSrc, VixSrc, XPass/2Embed.
- Anime providers: AllManga/AllAnime, Anikuro, AnimeGG, AnimeKai, AnimeOnsen, AnimePahe, AniPM, AniZone, HentaiGasm, HentaiNi, JustAnime, KickAssAnime, Kyren.
- Provider selection, provider racing, server menus, automatic fallback, health checks, stream validation, prefetching, subtitle harvesting, playback refresh, token minting, HLS/DASH handling, and embedded-player code.

## Removed provider and media domains

The removed code contained hardcoded or discovered references including `api.2embed.cc`, `www.2embed.cc`, `streamsrcs.2embed.cc`, `calluspirates.com`, `hexa.su`, `kisskh.co`, `player.videasy.net`, `vidking.net`, `vidlink.pro`, `vidnest.fun`, `vidrock.net`, `api.vidsrc.wtf`, `vidsrc-embed.ru`, `vixsrc.to`, `vixcloud.co`, `allanime.day`, `allmanga.to`, `animekai.to`, `animeonsen.xyz`, `animepahe.ch`, `ani.pm`, `anizone.to`, `hentaigasm.com`, `hentaini.com`, `justanime.to`, `kaa.lt`, and `kyren.moe`, plus dynamically discovered media hosts. None remain in executable code.

## Removed integrations and infrastructure

- All Flaresolverr code, container definitions, scripts, CI variables, and deployment configuration.
- Scrape proxies, VPN rotation, Gluetun, availability probes, arbitrary upstream proxy routes, and all scrape API routes.
- The bundled Movi player, direct-playback packages, iframe/embed URL construction, and arbitrary video URL handling.
- External catalogue sources (TMDB, AniList, MyAnimeList, Kitsu and related metadata proxies).
- Television, anime, live-channel, authentication, email, passkey, feature-flag, analytics, CDN/image-proxy, watchlist, and PostgreSQL code.
- Deployment tooling and production environment synchronization. No deployment was performed in this phase.

## Removed environment variables

The removed configuration included catalogue keys, authentication/email secrets, database URLs, Flaresolverr and scrape proxy settings, VPN control credentials, provider credentials, player secrets, feature-flag configuration, CDN/storage keys, CAPTCHA configuration, WebAuthn settings, analytics configuration, and deployment credentials. The demonstration app requires no environment variables.

## Current safety boundary

The application has no API routes, iframe renderer, video element, player package, provider URL field, proxy handler, scraper, authentication layer, email integration, or database adapter. Its content module stores presentation data only. Response headers restrict network connections to the same origin and prohibit frames, media sources, objects, and form submissions to other origins.
