import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { spawn } from "node:child_process";
import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const uiDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.resolve(uiDir, "..");
const outputDir = path.join(engineRoot, "output");
const offersPath = path.join(outputDir, "offers.json");
const limitedFlightsPath = path.join(outputDir, "ui_limited_flights.json");
const agodaOutputPath = path.join(outputDir, "ui_agoda_results.json");
const searchGuardPath = path.join(outputDir, ".ui-search-last.json");
const searchRunningPath = path.join(outputDir, ".ui-search-running");
const minSearchIntervalMs = 30 * 60 * 1000;

type JsonResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

type MiddlewareServer = {
  middlewares: {
    use: (handler: (req: IncomingMessage, res: JsonResponse, next: () => void) => void) => void;
  };
};

function sendJson(res: JsonResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body, null, 2));
}

function loadOffersPayload() {
  if (!fs.existsSync(offersPath)) {
    return {
      rows: [],
      source: "missing-output",
      message: "Brak output/offers.json. Uruchom limitowane wyszukiwanie albo build_offers.py.",
    };
  }
  const rows = JSON.parse(fs.readFileSync(offersPath, "utf8"));
  return {
    rows: Array.isArray(rows) ? rows : [],
    source: "output/offers.json",
    updatedAt: fs.statSync(offersPath).mtime.toISOString(),
  };
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: engineRoot,
      env: process.env,
      shell: false,
      windowsHide: true,
    });
    let log = "";
    child.stdout.on("data", (data) => {
      log += data.toString();
    });
    child.stderr.on("data", (data) => {
      log += data.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(log);
      else reject(new Error(log || `${command} exited with ${code}`));
    });
  });
}

function chooseLimitedFlights(body: Record<string, unknown>) {
  const allFlights = JSON.parse(
    fs.readFileSync(path.join(engineRoot, "examples", "flights.sample.json"), "utf8"),
  );
  const limit = Math.max(1, Math.min(Number(body.limitFlights) || 1, 2));
  const origin = String(body.origin || "").toUpperCase();
  const dest = String(body.dest || "").toUpperCase();
  const filtered = allFlights.filter((flight: { origin_iata?: string; dest_iata?: string }) => {
    if (origin && flight.origin_iata !== origin) return false;
    if (dest && flight.dest_iata !== dest) return false;
    return true;
  });
  return (filtered.length ? filtered : allFlights).slice(0, limit);
}

async function runLimitedSearch(body: Record<string, unknown>) {
  fs.mkdirSync(outputDir, { recursive: true });
  if (fs.existsSync(searchRunningPath)) {
    return { status: 409, payload: { ok: false, message: "Wyszukiwanie juz trwa." } };
  }
  if (fs.existsSync(searchGuardPath)) {
    const last = JSON.parse(fs.readFileSync(searchGuardPath, "utf8"));
    const age = Date.now() - Number(last.startedAt || 0);
    if (age < minSearchIntervalMs) {
      const minutes = Math.ceil((minSearchIntervalMs - age) / 60_000);
      return {
        status: 429,
        payload: {
          ok: false,
          message: `Guard aktywny. Zeby nie spamowac Agody, kolejne wyszukiwanie najwczesniej za ${minutes} min.`,
          ...loadOffersPayload(),
        },
      };
    }
  }

  const flights = chooseLimitedFlights(body);
  fs.writeFileSync(limitedFlightsPath, JSON.stringify(flights, null, 2), "utf8");
  fs.writeFileSync(searchRunningPath, String(Date.now()), "utf8");
  fs.writeFileSync(
    searchGuardPath,
    JSON.stringify({ startedAt: Date.now(), flights: flights.length }, null, 2),
    "utf8",
  );

  try {
    const scrolls = Math.max(1, Math.min(Number(body.scrolls) || 1, 3));
    const maxTotal = Math.max(1000, Math.min(Number(body.maxTotal) || 3000, 3500));
    const returnDate = String(body.returnDate || "2026-08-08");
    const minDays = Math.max(1, Math.min(Number(body.minDays) || 9, 21));
    const agodaLog = await runCommand(process.execPath, [
      "src/agoda_search.js",
      limitedFlightsPath,
      agodaOutputPath,
      `--scrolls=${scrolls}`,
    ]);
    const buildLog = await runCommand("python", [
      "src/build_offers.py",
      "--hotel-results",
      agodaOutputPath,
      "--out-json",
      offersPath,
      "--max-total",
      String(maxTotal),
      "--return-date",
      returnDate,
      "--min-days",
      String(minDays),
      "--limit",
      "50",
    ]);
    return {
      status: 200,
      payload: {
        ok: true,
        message: `Gotowe. Przeszukano ${flights.length} lot(y), scrolls=${scrolls}.`,
        log: `${agodaLog}\n${buildLog}`,
        ...loadOffersPayload(),
      },
    };
  } finally {
    fs.rmSync(searchRunningPath, { force: true });
  }
}

function voyaSearchApiPlugin() {
  return {
    name: "voya-search-api",
    configureServer(server: MiddlewareServer) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || "/", "http://localhost");
        if (requestUrl.pathname === "/api/voya/offers") {
          sendJson(res, 200, loadOffersPayload());
          return;
        }
        if (requestUrl.pathname === "/api/voya/search" && req.method === "POST") {
          try {
            const body = await readJsonBody(req);
            const result = await runLimitedSearch(body);
            sendJson(res, result.status, result.payload);
          } catch (error) {
            sendJson(res, 500, {
              ok: false,
              message: error instanceof Error ? error.message : "Nieznany blad wyszukiwania.",
              ...loadOffersPayload(),
            });
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // Expose both the default VITE_ prefix and our project's VOYA_ prefix
    // to import.meta.env. Works for values from .env files AND from the
    // shell environment (e.g. an export in ~/.zshrc).
    envPrefix: ["VITE_", "VOYA_"],
    plugins: [voyaSearchApiPlugin()],
  },
});
