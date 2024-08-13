import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "";

export function checkRoles(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({error: "Unauthorized. No token provided"});
    }
    try {
      const payLoad: any = jwt.verify(token, String(process.env.SECRET_KEY));

      if (!roles.includes(payLoad.role)) {
        return res.status(403).json({
          error: "Forbidden access. User doesn't have the required role",
        });
      }
    } catch (error) {
      return res.status(403).json({error: "Forbidden access. Invalid token"});
    }

    console.log(token);
    next();
  };
}
// Middleware to verify token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({error: "No token provided."});
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({error: "Failed to authenticate token."});
    }

    (req as any).user = decoded;
    next();
  });
};
