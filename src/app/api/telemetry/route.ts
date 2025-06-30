import { NextRequest, NextResponse } from "next/server";

// Fonction simple pour coloriser le JSON avec des codes ANSI
function colorizeJSON(jsonString: string): string {
  return jsonString
    .replace(/"([^"]+)":/g, '\x1b[34m"$1"\x1b[0m:') // Clés en bleu
    .replace(/: "([^"]*)"/g, ': \x1b[32m"$1"\x1b[0m') // Strings en vert
    .replace(/: (\d+\.?\d*)/g, ": \x1b[33m$1\x1b[0m") // Nombres en jaune
    .replace(/: (true|false)/g, ": \x1b[35m$1\x1b[0m") // Booleans en magenta
    .replace(/: null/g, ": \x1b[31mnull\x1b[0m"); // null en rouge
}

type LogEntry = {
  timestamp: string;
  level: "log" | "error" | "warn" | "debug";
  args: string[];
};

type TelemetryBody = {
  logs: LogEntry[];
};

export async function POST(req: NextRequest) {
  const body: TelemetryBody = await req.json();

  // Le body contient un tableau de logs dans la propriété 'logs'
  let logs = body.logs || [];

  logs = Array.isArray(logs) ? logs : [logs];

  // Créer une log par élément
  logs.forEach((logEntry: LogEntry) => {
    const timestamp = new Date(logEntry.timestamp).toLocaleString("fr-FR");
    const levelIcon =
      {
        error: "🔴",
        warn: "🟡",
        debug: "🔵",
        log: "⚪",
      }[logEntry.level] || "⚪";

    // Formater les arguments en détectant les objets JSON
    const formattedArgs = logEntry.args.map((arg) => {
      try {
        // Tenter de parser si c'est une chaîne qui ressemble à du JSON
        if (
          typeof arg === "string" &&
          (arg.startsWith("{") || arg.startsWith("["))
        ) {
          const parsed = JSON.parse(arg);
          return process.env.NODE_ENV === "development"
            ? `\n${colorizeJSON(JSON.stringify(parsed, null, 2))}\n`
            : JSON.stringify(parsed);
        }
        return arg;
      } catch {
        // Si le parsing échoue, retourner l'argument tel quel
        return arg;
      }
    });

    const message =
      process.env.NODE_ENV === "development" &&
      formattedArgs.some((arg) => arg.includes("\n"))
        ? formattedArgs.join("\n  ") // Nouvelle ligne pour les objets JSON formatés
        : formattedArgs.join(" "); // Espace pour les arguments simples

    const prettyLog =
      process.env.NODE_ENV === "development" && message.includes("\n")
        ? `${levelIcon} [FRONTEND] ${timestamp}\n  ${message}`
        : `${levelIcon} [FRONTEND] ${timestamp} - ${message}`;

    const logObject = {
      labels: {
        job: "frontend",
        level: logEntry.level,
      },
      timestamp: logEntry.timestamp,
      message: logEntry.args.join(" "),
      args: logEntry.args,
    };

    // Format lisible en développement, compact en production
    const logData =
      process.env.NODE_ENV === "development"
        ? prettyLog
        : JSON.stringify(logObject);

    // Utiliser la bonne fonction de console selon le level
    switch (logEntry.level) {
      case "debug":
        console.debug(logData);
        break;
      case "error":
        console.error(logData);
        break;
      case "warn":
        console.warn(logData);
        break;
      case "log":
      default:
        console.log(logData);
        break;
    }
  });

  return NextResponse.json({
    status: "ok",
    processed: logs.length,
  });
}
