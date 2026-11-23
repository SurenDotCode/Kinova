import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { readConfig } from "../src/config.js";

describe("HTTP service", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createApp().listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  });

  it("returns uncached liveness status over HTTP", async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-powered-by")).toBeNull();
    expect(await response.json()).toEqual({ status: "ok", service: "kinova" });
  });

  it("returns JSON 404 for unavailable features", async () => {
    const response = await fetch(`${baseUrl}/medicines`);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });
});

describe("configuration", () => {
  it("supports an empty development environment", () => {
    expect(readConfig({})).toEqual({ NODE_ENV: "development", HOST: "127.0.0.1", PORT: 3000 });
  });

  it.each(["", "abc", "0", "-1", "65536", "3000.5"])("rejects invalid port %s", PORT => {
    expect(() => readConfig({ PORT })).toThrow("Invalid configuration: PORT");
  });

  it("uses valid configured values", () => {
    expect(readConfig({ PORT: "8080", HOST: "0.0.0.0", NODE_ENV: "production" }).PORT).toBe(8080);
  });

  it("rejects unknown environments without revealing their value", () => {
    expect(() => readConfig({ NODE_ENV: "private-value" })).toThrow("Invalid configuration: NODE_ENV");
  });
});
