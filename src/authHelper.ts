import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export default class AuthHelper {
  static uploadRoles = process.env.UPLOAD_ROLES.split(",").map((role) => role.trim());

  static checkJwt(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1] as string;
      let jwtPayload = jwt.verify(token, process.env.JWT_SECRET) as any;
      res.locals.jwtPayload = jwtPayload;
      if (AuthHelper.uploadRoles.indexOf(jwtPayload.role) !== -1) {
        next();
      } else {
        res.status(401).send({ message: "Unauthorized" });
      }
    } catch (err) {
      res.status(401).send();
      return;
    }
  }
}
