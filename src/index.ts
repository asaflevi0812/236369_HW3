import { createServer, IncomingMessage, ServerResponse } from "http";

// import with .js, and not ts.
// for more info: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#type-in-package-json-and-new-extensions
import { mainRoute as defaultRoute, createRoute, routes } from "./routes.js";

const port = process.env.PORT || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const route = createRoute(req.url, req.method);
  Object.keys(routes).forEach((routeRegex: string) => {
    if (route.match(routeRegex)) {
      routes[routeRegex](req, res);
      return;
    }
  })
  defaultRoute(req, res);
});

server.listen(port);
console.log(`Server running! port ${port}`);
