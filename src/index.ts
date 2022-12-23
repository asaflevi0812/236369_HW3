import { createServer, IncomingMessage, ServerResponse } from "http";

// import with .js, and not ts.
import { mainRoute as defaultRoute, createRoute, routes } from "./routes.js";
import * as mongoose from "mongoose";
// enable environment variables
import * as dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

// Connect to mongoDB
await mongoose.connect(process.env.DB_URI);

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const route = createRoute(req.url, req.method);
  let foundRoute: boolean = false;
  Object.keys(routes).every((routeRegex: string) => {
    if (route.match(routeRegex)) {
      routes[routeRegex](req, res);
      foundRoute = true;
      return false;
    }
    return true;
  })
  if (!foundRoute)
    defaultRoute(req, res);
});

server.listen(port);
console.log(`Server running! port ${port}`);
