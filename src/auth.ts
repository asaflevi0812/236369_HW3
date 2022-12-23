import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { ERROR_401 } from "./const.js";
import User from "./models/user.js"

// TODO: You need to config SERCRET_KEY in render.com dashboard, under Environment section.
const secretKey = process.env.SECRET_KEY;

// Verify JWT token
const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return false;
  }
};

// Middelware for all protected routes. 
// TODO: You need to expend it, implement premissions and handle with errors.
export const protectedRout = (req: IncomingMessage, res: ServerResponse) => {
  let authHeader = req.headers["authorization"] as string;

  // authorization header needs to look like that: Bearer <JWT>.
  // So, we just take to <JWT>.
  if (!authHeader.match('Bearer [0-9A-Za-z\\\+=\.]*')) {
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        message: "Invalid auth header.",
      })
    );
    return ERROR_401;
  }
  let authHeaderSplited = authHeader && authHeader.split(" ");
  const token = authHeaderSplited && authHeaderSplited[1];

  if (!token) {
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        message: "No token.",
      })
    );
    return ERROR_401;
  }

  // Verify JWT token
  const user = verifyJWT(token);
  if (!user) {
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        message: "Failed to verify JWT.",
      })
    );
    return ERROR_401;
  }

  // We are good!
  return user;
};

export const loginRoute = (req: IncomingMessage, res: ServerResponse) => {
  // Read request body.
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const credentials = JSON.parse(body);

    const validRequest: boolean = Object.keys(credentials).length == 2 &&
                                  credentials.hasOwnProperty('username') && 
                                  credentials.hasOwnProperty('password');
    if (!validRequest) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
        message: "Bad request.",
      }));
      return;
    }
    // Check if username and password match
    const user = await User.findOne((u) => u.username === credentials.username);
    if (!user) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          message: "Invalid username or password.",
        })
      );
      return;
    }

    // bcrypt.hash create single string with all the informatin of the password hash and salt.
    // Read more here: https://en.wikipedia.org/wiki/Bcrypt
    // Compare password hash & salt.
    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!passwordMatch) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          message: "Invalid username or password.",
        })
      );
      return;
    }

    // Create JWT token.
    // This token contain the userId in the data section.
    const token = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.end(
      JSON.stringify({
        token: token,
      })
    );
  });
};

export const signupRoute = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const credentials = JSON.parse(body);

    const validRequest: boolean = Object.keys(credentials).length == 2 &&
                                  credentials.hasOwnProperty('username') && 
                                  credentials.hasOwnProperty('password');
    if (!validRequest) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Invalid sign up request.",
        })
      );
      return;
    }

    const username = credentials.username;
    const password = await bcrypt.hash(credentials.password, 10);
    new User({ id: uuidv4(), username, password, permission: "W" }).save();

    res.statusCode = 201; // Created a new user!
    res.end(
      JSON.stringify({
        username,
      })
    );
  });
};
