"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { setupClientTelemetry } from "@/lib/setupClientTelemetry";

export default function WinstonTestComponent() {
  useEffect(() => {
    // Initialiser la télémétrie après que Winston soit disponible
    setupClientTelemetry();

    // Test des logs Winston
    setTimeout(() => {
      logger.info("Winston logger initialized successfully");
      logger.warn("This is a warning from Winston");
      logger.error("This is an error from Winston", {
        userId: 123,
        action: "test",
      });
      logger.debug("Debug information", {
        data: { nested: "object" },
      });

      // Test des logs console classiques
      console.log("Regular console log");
      console.warn("Regular console warning");
      console.error("Regular console error");
    }, 1000);
  }, []);

  const handleTestLogs = () => {
    // Tests manuels
    logger.info("Manual test log from Winston");
    console.log("Manual test log from console");

    // Test avec objet complexe
    logger.error("Complex error", {
      error: {
        code: 500,
        message: "Internal server error",
        details: {
          timestamp: new Date().toISOString(),
          stack: ["error1", "error2"],
        },
      },
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        Winston Telemetry Test
      </h2>
      <p className="text-gray-600">
        Ce composant teste l&apos;intégration Winston + Télémétrie. Ouvrez la
        console du navigateur et les logs du serveur pour voir les résultats.
      </p>

      <button
        onClick={handleTestLogs}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        🧪 Test Logs Manual
      </button>

      <div className="text-sm text-gray-500">
        <p>✅ Winston Logger: Configuré</p>
        <p>✅ Télémétrie: Active</p>
        <p>📡 API Endpoint: /api/telemetry</p>
      </div>
    </div>
  );
}
