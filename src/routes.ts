import { IncomingMessage, ServerResponse } from "http";
import { loginRoute, protectedRout, signupRoute } from "./auth.js";
import { ERROR_401 } from "./const.js";

const exampleData = {
  title: "This is a nice example!",
  subtitle: "Good Luck! :)",
};

export const createRoute = (url: string, method: string) => {
  return `${method} ${url}`;
};

export const mainRoute = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.write("<h1>Hello Yedidi! API:</h1>");
  res.write(`<ul>
      <li>signin. POST /api/signin</li>
      <li>login. POST /api/login</li>      
  </ul>`);
  res.end();
};

export const routes: Object = {
  'GET /api/product/[0-9]*': mainRoute,
  'GET /api/product/[A-Za-z]*': mainRoute,
  'POST /api/product': mainRoute,
  'PUT /api/product': mainRoute,
  'DELETE /api/product': mainRoute,
  'POST /api/signup': signupRoute,
  'POST /api/login': loginRoute,
  'PUT /api/permission': mainRoute,
};
