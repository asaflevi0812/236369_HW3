import { IncomingMessage, ServerResponse } from "http";
import { assertPermission, loginRoute, protectedRout, signupRoute } from "./auth.js";
import { ERROR_401 } from "./const.js";
import { v4 as uuidv4 } from "uuid";
import Product from "./models/product.js";
import User from "./models/user.js";

type HandleRequestFunction = (req: IncomingMessage, res: ServerResponse, body: any) => Promise<void>;

export const validateProductParams = (body: any): boolean => {
  let isValid: boolean = true;
  if (body.hasOwnProperty("name")) {
    isValid = isValid && (typeof body.name) === (typeof "");
  }
  if (body.hasOwnProperty("description")) {
    isValid = isValid && (typeof body.description) === (typeof "");
  }
  if (body.hasOwnProperty("category")) {
    isValid = isValid && (typeof body.category) === (typeof "") &&
    ["t-shirt", "hoodie", "hat", "necklace", "bracelet",
      "shoes", "pillow", "mug", "book", "puzzle", "cards"].
        find((category) => category === body.category.toLowerCase()) !== undefined;
    if (isValid) body.category = body.category.toLowerCase();
  }
  if (body.hasOwnProperty("price")) {
    isValid = isValid && (typeof body.price) === (typeof 0) && body.price >= 0 && body.price <= 1000;
  }
  if (body.hasOwnProperty("stock")) {
    isValid = isValid && (typeof body.stock) === (typeof 0) && body.stock >= 0;
  }
  if (body.hasOwnProperty("image")) {
    isValid = isValid && (typeof body.image) === (typeof "");
    // check that it is a valid URL.
    try {
      new URL(body.image);
    } catch(e) {
      isValid = false;
    }
  }
  return isValid;
}

export const takePathParameter = (url: string): string => {
  const urlList = url.split('/');
  return urlList[urlList.length - 1];
}

export const createRoute = (url: string, method: string) => {
  return `${method} ${url}`;
};

export const mainRoute = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
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

export const validateRequest = async(req: IncomingMessage, 
                                     res: ServerResponse,
                                     permissions: string[],
                                     fields: string[],
                                     optionalFields: string[],
                                     handler: HandleRequestFunction) => {
  // check for unauthorized
  const user = protectedRout(req, res);
  if (user == ERROR_401) {
    return;
  }
  // check for forbidden
  if (!await assertPermission(user, permissions, res)) {
    return;
  }
  // no body for get
  if (req.method === "GET" || req.method === "DELETE") {
    handler(req, res, {});
    return;
  }

  // check for bad request
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    let validRequest: boolean = true;
    let bodyJSON: any;
    try {
      bodyJSON = await JSON.parse(body);
    } catch(e) {
      validRequest = false;
    }

    // all required fields exist, no non-optional fields exist.
    validRequest = validRequest && 
                   Object.keys(bodyJSON).length >= fields.length &&
                   Object.keys(bodyJSON).length <= fields.length + optionalFields.length;
    fields.every((field: string): boolean => {
      validRequest = validRequest && bodyJSON.hasOwnProperty(field);
      return validRequest;
    });
    const allFields = [...fields, ...optionalFields];
    Object.keys(bodyJSON).every((field) => {
      validRequest = validRequest && 
        (allFields.find((possibleField) => (field === possibleField)) !== undefined);
      return validRequest;
    });

    if (!validRequest) {
      res.statusCode = 400;
      res.end(JSON.stringify({message: 'Bad request'}));
      return;
    }

    handler(req, res, bodyJSON);
  });
}

export const createProduct = async(req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A", "M"], 
                  ["name", "category", "description", "price", "stock"],
                  ["image"],
  async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
    if (!validateProductParams(body)) {
      res.statusCode = 400;
      res.end(JSON.stringify({message: 'Bad request'}));
      return;
    }
    
    body.id = uuidv4();
    const product = new Product(body);
    const dbRes = await product.save();
    console.log(dbRes);
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({id: body.id}));
    res.end();
  });
};

export const getProduct = async (req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A", "M", "W"], 
                  [],
                  [],
  async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
    const id = takePathParameter(req.url);
    const product = await Product.findOne({id: id});
    if (!product) {
      res.statusCode = 404;
      res.end(JSON.stringify({message: "product not found"}));
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(product));
    res.end();
  });
};

export const getCategoryProducts = async (req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A", "M", "W"], 
                  [],
                  [],
    async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
      const category = takePathParameter(req.url);
      const products = await Product.find({category: category.toLowerCase()});
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(products));
      res.end();
    });
};

export const updateProduct = async (req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A", "M"], 
                  [],
                  ["name", "category", "description", "price", "stock", "image"],
  async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
    if (!validateProductParams(body)) {
      res.statusCode = 400;
      res.end(JSON.stringify({message: 'Bad request'}));
      return;
    }

    const id = takePathParameter(req.url);
    const product = await Product.findOneAndUpdate({id: id}, body);
    if (!product) {
      res.statusCode = 404;
      res.end(JSON.stringify({message: "product not found"}));
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({id: id}));
    res.end();
  });
}

export const deleteProduct = async (req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A"], 
                  [],
                  [],
  async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
    const id = takePathParameter(req.url);
    const product = await Product.findOneAndDelete({id: id});
    if (!product) {
      res.statusCode = 404;
      res.end(JSON.stringify({message: "product not found"}));
    }
    res.statusCode = 200;
    res.end();
});
};

export const updatePermission = async (req: IncomingMessage, res: ServerResponse) => {
  validateRequest(req, res, 
                  ["A"], 
                  ["username", "permission"],
                  [],
  async(req: IncomingMessage, res: ServerResponse, body: any): Promise<void> => {
    if (body.permission !== "W" && body.permission !== "M") {
      res.statusCode = 400;
      res.end(JSON.stringify({message: 'Bad request'}));
      return;
    }

    const user = await User.findOneAndUpdate({username: body.username}, 
                                             {permission: body.permission});
    if (!user) {
      res.statusCode = 400;
      res.end(JSON.stringify({message: 'Invalid username'}));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({message: 'success'}));
    res.end();
  });
};



export const routes: Object = {
  'get /api/product/[0-9A-Fa-f\-]{36}': getProduct,
  'get /api/product/(t-shirt|hoodie|hat|necklace\
  |bracelet|shoes|pillow|mug|book|puzzle|cards)': getCategoryProducts,
  'post /api/product': createProduct,
  'put /api/product/[0-9A-Fa-f\-]{36}': updateProduct,
  'delete /api/product/[0-9A-Fa-f\-]{36}': deleteProduct,
  'post /api/signup': signupRoute,
  'post /api/login': loginRoute,
  'put /api/permission': updatePermission,
};
