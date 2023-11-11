import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';



export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        const err = new Error("Unauthorized");
        err.statusCode = 401;
        return next(err);
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, 'Forbidden'));
        }
        req.userId = user;
        next();
    });
}