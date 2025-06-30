"use client";

import logger from "@/lib/logger";
import { setupClientTelemetry } from "@/lib/setupClientTelemetry";
import { useEffect } from "react";

export default function Component() {
  useEffect(() => {
    setupClientTelemetry();
    console.log("Client telemetry setup complete", {
      yolo: "yo",
      userId: 123,
    });
    logger.info("Client telemetry initialized successfully from winston", {
      userId: 123,
      action: "init",
    });
  }, []);
  return <></>;
}
