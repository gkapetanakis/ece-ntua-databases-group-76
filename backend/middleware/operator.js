import { codes } from "../app.js";

function verifyOperator(_req, res, next) {
    if (!res.locals.username || res.locals.role !== "operator") {
        return res.redirect(codes.FORBIDDEN, "/");
    }

    return next();
}

export { verifyOperator };
