import { handleRequest } from "./router";

const port = Number(process.env.PORT ?? 8787);

Bun.serve({
  hostname: '0.0.0.0',
  port,
  fetch: handleRequest,
});

console.log(`🪔 Bhagwati admin API → http://0.0.0.0:${port}`);
