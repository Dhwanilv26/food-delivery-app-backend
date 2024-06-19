import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import jwt from 'jsonwebtoken';
import User from '../models/user';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }
  //Bearer thisistherealtoken [1] vaala
  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    const auth0Id = decoded.sub;
    // .sub holds the decoded id .. just a convention (by auth)

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();

    next(); // telling express that we are finished with the middleware
    // now do the next thing to the controller handler
  } catch (error) {
    return res.sendStatus(401);
  }
};
