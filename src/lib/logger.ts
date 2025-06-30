// Logger client simplifié compatible navigateur
interface LogMetadata {
  [key: string]: unknown;
}

interface SimpleLogger {
  info: (message: string, meta?: LogMetadata) => void;
  warn: (message: string, meta?: LogMetadata) => void;
  error: (message: string, meta?: LogMetadata) => void;
  debug: (message: string, meta?: LogMetadata) => void;
  log: (level: string, message: string, ...meta: unknown[]) => void;
}

class ClientLogger implements SimpleLogger {
  private formatMessage(
    level: string,
    message: string,
    meta?: LogMetadata
  ): void {
    const timestamp = new Date().toISOString();

    // Utiliser console natif avec formatage
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case "error":
        console.error(formattedMessage, meta || "");
        break;
      case "warn":
        console.warn(formattedMessage, meta || "");
        break;
      case "debug":
        console.debug(formattedMessage, meta || "");
        break;
      default:
        console.log(formattedMessage, meta || "");
    }
  }

  info(message: string, meta?: LogMetadata): void {
    this.formatMessage("info", message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    this.formatMessage("warn", message, meta);
  }

  error(message: string, meta?: LogMetadata): void {
    this.formatMessage("error", message, meta);
  }

  debug(message: string, meta?: LogMetadata): void {
    this.formatMessage("debug", message, meta);
  }

  log(level: string, message: string, ...meta: unknown[]): void {
    this.formatMessage(level, message, meta.length > 0 ? { meta } : undefined);
  }
}

// Créer l'instance du logger
export const logger = new ClientLogger();

// Simuler winston pour la compatibilité
const winstonCompatible = {
  createLogger: () => logger,
  loggers: {
    add: () => logger,
  },
};

// Exposer pour la télémétrie
if (typeof window !== "undefined") {
  (window as typeof window & { winston: typeof winstonCompatible }).winston =
    winstonCompatible;
}

export default logger;
