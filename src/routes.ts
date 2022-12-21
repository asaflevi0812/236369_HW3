import { IncomingMessage, ServerResponse } from "http";
import { loginRoute, protectedRout, signupRoute } from "./auth.js";
import { ERROR_401 } from "./const.js";
import Product from "./models/product.js";

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
      <li>get product info by ID. GET /api/product/\<product ID\></li>      
      <li>get products info by Category. GET /api/product/\<category name\></li>      
      <li>add a product. POST /api/product</li>      
      <li>update a product. PUT /api/product</li> 
      <li>delete a product. DELETE /api/product</li> 
      <li>sign up. POST /api/signup</li> 
      <li>login. POST /api/login</li> 
      <li>update permission. PUT /api/permission</li> 
  </ul>`);
  res.end();
};

export const createProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 201;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(product)); // build in js function, to convert json to a string
  res.end();
};

export const getProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 201;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(product)); // build in js function, to convert json to a string
  res.end();
};

export const getCategoryProducts = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });
  const products = [product];

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 201;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(products)); // build in js function, to convert json to a string
  res.end();
};

export const updateProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 201;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(product)); // build in js function, to convert json to a string
  res.end();
};

export const deleteProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(product)); // build in js function, to convert json to a string
  res.end();
};

export const updatePermission = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }

  // Check the type of this object (with TS)
  const product = new Product({
    name: "Nisso",
    age: 28,
    animal: "Fish",
  });

  /*
  // Mongoose automaticlly will insert this document to our collection!
  const dbRes = await segel.save();
  console.log(dbRes);*/
  
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(product)); // build in js function, to convert json to a string
  res.end();
};



export const routes: Object = {
  'GET /api/product/[0-9]*': getProduct,
  'GET /api/product/[A-Za-z]*': getCategoryProducts,
  'POST /api/product': createProduct,
  'PUT /api/product': updateProduct,
  'DELETE /api/product': deleteProduct,
  'POST /api/signup': signupRoute,
  'POST /api/login': loginRoute,
  'PUT /api/permission': updatePermission,
};
