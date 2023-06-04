import { codes } from "../app.js";

function verifyAdmin(_req, res, next) {
    if (!res.locals.username || res.locals.role !== "admin") {
        return res.redirect(codes.FORBIDDEN, "/");
    }

    return next();
}

export { verifyAdmin };
