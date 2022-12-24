import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { ERROR_401 } from "./const.js";
import User from "./models/user.js"

// enable environment variables
import * as dotenv from "dotenv";

dotenv.config();

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
  console.log(user);
  return user;
};

export const checkPermission = async(user: any, permissions: string[]) : Promise<boolean> => {
  if (!user.hasOwnProperty("id")) {
    return false;
  }
  const userFromDB = await User.findOne({id: user.id});
  return permissions.find((permission) => permission === userFromDB.permission) != undefined
}

export const assertPermission = async(user: any, 
                                      permissions: string[], 
                                      res: ServerResponse) : Promise<boolean> => {
  if (!await checkPermission(user, permissions)) {
    res.statusCode = 403;
    res.end(JSON.stringify({message: 'insufficient permissions.'}));
    return false;
  }
  return true;
}

export const loginRoute = (req: IncomingMessage, res: ServerResponse) => {
  // Read request body.
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    let credentials: any;
    let validRequest: boolean = true;
    try {
      credentials = await JSON.parse(body);
    } catch(e) {
      validRequest = false;
    }

    validRequest = validRequest &&
                   Object.keys(credentials).length == 2 &&
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
    const user = await User.findOne({ username : credentials.username});
    if (!user) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          message: "Invalid username or password.",
        })
      );
      return;
    }

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
    let credentials: any;
    let validRequest: boolean = true;
    try {
      credentials = await JSON.parse(body);
    } catch(e) {
      validRequest = false;
    }

    validRequest = validRequest &&
                   Object.keys(credentials).length == 2 &&
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
    
    // Check if username and password match
    const user = await User.findOne({username: credentials.username});
    if (user) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Username is taken.",
        })
      );
      return;
    }

    if (credentials.password === "") {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Password is empty.",
        })
      );
      return;
    }

    const username = credentials.username;
    const password = await bcrypt.hash(credentials.password, 10);
    const newUser = new User({ id: uuidv4(), 
                               username: username, 
                               password: password, 
                               permission: "W" });
    const dbRes = await newUser.save();
    console.log(dbRes);

    res.statusCode = 201; // Created a new user!
    res.end(
      JSON.stringify({
        username,
      })
    );
  });
};
