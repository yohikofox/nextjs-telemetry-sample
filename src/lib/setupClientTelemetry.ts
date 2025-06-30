type LogLevel = "log" | "error" | "warn";
type ConsoleMethod = (...args: unknown[]) => void;

// Types pour Winston
interface WinstonLogger {
  log: (level: string, message: string, ...meta: unknown[]) => unknown;
}

interface WindowWithWinston extends Window {
  winston?: {
    loggers?: {
      add: (id: string, options: Record<string, unknown>) => WinstonLogger;
    };
    createLogger?: (options: Record<string, unknown>) => WinstonLogger;
  };
}

// Helper pour sérialiser les arguments de manière sûre
function serializeArgs(args: unknown[]): string[] {
  return args.map((arg) => {
    try {
      if (arg instanceof Error) {
        return `Error: ${arg.message}\n${arg.stack}`;
      }
      if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    } catch {
      return "[Non-serializable object]";
    }
  });
}

// Helper pour envoyer la télémétrie avec retry et throttling
const telemetryQueue: Array<{
  timestamp: string;
  level: LogLevel;
  args: string[];
}> = [];

let isProcessing = false;

async function sendTelemetry() {
  if (isProcessing || telemetryQueue.length === 0) return;

  isProcessing = true;
  const batch = telemetryQueue.splice(0, 10); // Traiter par batch de 10

  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: batch }),
    });
  } catch (error) {
    console.warn("[Telemetry] Failed to send logs:", error);
    // Remettre en queue les logs en cas d'échec (avec limite)
    if (telemetryQueue.length < 100) {
      telemetryQueue.unshift(...batch);
    }
  } finally {
    isProcessing = false;
    // Traiter la queue suivante si nécessaire
    if (telemetryQueue.length > 0) {
      setTimeout(sendTelemetry, 1000);
    }
  }
}

export function setupClientTelemetry() {
  // Vérifier si on est côté client
  if (typeof window === "undefined") {
    console.warn(
      "[Telemetry] setupClientTelemetry should only be called on the client side"
    );
    return;
  }

  // Intercepter console.* (pour les logs directs)
  const logLevels: LogLevel[] = ["log", "error", "warn"];

  logLevels.forEach((level) => {
    const originalMethod = console[level] as ConsoleMethod;

    (console[level] as ConsoleMethod) = (...args: unknown[]) => {
      // Toujours appeler la méthode originale en premier
      originalMethod.apply(console, args);

      try {
        // Ajouter à la queue de télémétrie
        telemetryQueue.push({
          timestamp: new Date().toISOString(),
          level,
          args: serializeArgs(args),
        });

        // Déclencher l'envoi (avec debounce)
        setTimeout(sendTelemetry, 100);
      } catch (error) {
        // Ne pas faire échouer le log original si la télémétrie échoue
        console.warn("[Telemetry] Failed to queue log:", error);
      }
    };
  });

  // Intercepter Winston si présent
  if (typeof window !== "undefined" && (window as WindowWithWinston).winston) {
    setupWinstonInterception();
  }

  // Nettoyer la queue au déchargement de la page
  window.addEventListener("beforeunload", () => {
    if (telemetryQueue.length > 0) {
      navigator.sendBeacon?.(
        "/api/telemetry",
        JSON.stringify({ logs: telemetryQueue })
      );
    }
  });
}

// Helper pour intercepter Winston
function setupWinstonInterception() {
  try {
    const winston = (window as WindowWithWinston).winston;
    if (!winston?.loggers) return;

    // Intercepter tous les loggers Winston
    const originalAdd = winston.loggers.add;
    winston.loggers.add = function (
      id: string,
      options: Record<string, unknown>
    ) {
      const logger = originalAdd.call(this, id, options);
      interceptWinstonLogger(logger);
      return logger;
    };

    // Intercepter le logger par défaut si il existe
    if (winston.createLogger) {
      const originalCreateLogger = winston.createLogger;
      winston.createLogger = function (options: Record<string, unknown>) {
        const logger = originalCreateLogger.call(this, options);
        interceptWinstonLogger(logger);
        return logger;
      };
    }
  } catch (error) {
    console.warn("[Telemetry] Failed to setup Winston interception:", error);
  }
}

function interceptWinstonLogger(logger: WinstonLogger) {
  if (!logger?.log) return;

  const originalLog = logger.log;
  logger.log = function (level: string, message: string, ...meta: unknown[]) {
    // Appeler la méthode originale
    const result = originalLog.call(this, level, message, ...meta);

    try {
      // Mapper les niveaux Winston vers nos niveaux
      const mappedLevel = mapWinstonLevel(level);

      // Ajouter à notre queue de télémétrie
      telemetryQueue.push({
        timestamp: new Date().toISOString(),
        level: mappedLevel,
        args: serializeArgs([message, ...meta]),
      });

      setTimeout(sendTelemetry, 100);
    } catch (error) {
      console.warn("[Telemetry] Failed to queue Winston log:", error);
    }

    return result;
  };
}

function mapWinstonLevel(winstonLevel: string): LogLevel {
  switch (winstonLevel.toLowerCase()) {
    case "error":
      return "error";
    case "warn":
    case "warning":
      return "warn";
    case "info":
    case "debug":
    case "verbose":
    case "silly":
    default:
      return "log";
  }
}
