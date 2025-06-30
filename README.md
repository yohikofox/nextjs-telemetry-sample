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
```

### Démarrage

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Configuration de la télémétrie

```typescript
// Dans votre composant ou page
import { setupClientTelemetry } from '@/lib/setupClientTelemetry';
import { logger } from '@/lib/logger';

// Initialiser la télémétrie
useEffect(() => {
  setupClientTelemetry();
}, []);

// Utiliser les logs
logger.info('Message info', { userId: 123 });
console.log('Console log classique');
```

## 📊 Exemple de sortie

### Console navigateur
```
[2025-06-30T15:30:15.000Z] INFO: Winston logger initialized successfully { userId: 123 }
Console log classique
```

### Terminal serveur (développement)
```
⚪ [FRONTEND] 30/06/2025 17:30:15
  Winston logger initialized successfully
  {
    "userId": 123,
    "action": "test"
  }

🔴 [FRONTEND] 30/06/2025 17:30:16 - Console log classique
```

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── api/telemetry/route.ts    # API endpoint pour recevoir les logs
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── WinstonTest.tsx           # Composant de démonstration
└── lib/
    ├── setupClientTelemetry.ts   # Système de télémétrie client
    └── logger.ts                 # Logger compatible Winston
```

## 🔧 Configuration

### Variables d'environnement
- `NODE_ENV=development` : Active le formatage lisible des logs
- `NODE_ENV=production` : Format JSON compact pour les parsers

### Next.js Config
Le fichier `next.config.ts` configure webpack pour exclure les modules Node.js côté client.

## 🧪 Tests

Utilisez le composant `WinstonTest` pour tester :
- Logs automatiques au chargement
- Tests manuels avec le bouton
- Objets JSON complexes
- Différents niveaux de log

## 📚 API

### `setupClientTelemetry()`
Initialise le système de télémétrie. À appeler une fois côté client.

### `logger.*`
- `logger.info(message, meta?)` - Log d'information
- `logger.warn(message, meta?)` - Avertissement  
- `logger.error(message, meta?)` - Erreur
- `logger.debug(message, meta?)` - Debug

### Endpoint `/api/telemetry`
```typescript
POST /api/telemetry
Content-Type: application/json

{
  "logs": [
    {
      "timestamp": "2025-06-30T15:30:15.000Z",
      "level": "info",
      "args": ["Message", "data"]
    }
  ]
}
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
