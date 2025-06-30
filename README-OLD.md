# Next.js Telemetry Sample

Ce projet démontre l'implémentation d'un système de télémétrie client-serveur pour une application Next.js. Il capture automatiquement les logs côté client (console.* et Winston) et les transmet au serveur avec un formatage lisible.

## 🚀 Fonctionnalités

- ✅ **Capture automatique** des logs `console.*` (log, warn, error)
- ✅ **Support Winston** avec API compatible navigateur
- ✅ **Télémétrie batch** avec retry et throttling
- ✅ **Formatage intelligent** : JSON colorisé en développement, compact en production
- ✅ **API robuste** : Gestion des erreurs et normalisation des données
- ✅ **TypeScript** complet avec types stricts

## 📋 Architecture

### Client (`setupClientTelemetry.ts`)
- Intercepte `console.*` et logs Winston
- Queue avec traitement par batch (10 logs max)
- Retry automatique en cas d'échec
- Sérialisation sécurisée des arguments
- `sendBeacon` pour les logs lors du déchargement

### Serveur (`/api/telemetry/route.ts`)
- Reçoit les batch de logs
- Formatage conditionnel selon `NODE_ENV`
- Colorisation JSON en développement
- Mapping intelligent des niveaux de log

## 🛠️ Installation et Utilisation

### Installation

```bash
npm install
# ou
yarn install
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
