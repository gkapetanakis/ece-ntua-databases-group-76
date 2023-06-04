import { pool, codes } from "../app.js";

async function execFetchQuery(_req, res, next) {
    try {
        let result = await pool.query(
            res.locals.queryOptions,
            res.locals.queryValues
        );

        if (res.locals.queryOptions.split(" ")[0].toLowerCase() === "call")
            result = result[0];

        res.locals.rows = result;

        if (!res.locals.nFields) {
            res.locals.nFields = [];
            for (let i = 0; i < res.locals.lastColBtns ?? 1; ++i)
                res.locals.nFields.push(1);
        }

        return res.status(codes.OK).render(res.locals.nextPage ?? "results");
    } catch (err) {
        return next(err);
    }
}

async function execInsertQuery(_req, res, next) {
    try {
        await pool.query(res.locals.queryOptions, res.locals.queryValues);

        if (!res.locals.successMessage)
            res.locals.successMessage = "Action was successful";

        if (!res.locals.backUrl) res.locals.backUrl = "/";

        return res
            .status(codes.CREATED)
            .render(res.locals.nextPage ?? "success");
    } catch (err) {
        return next(err);
    }
}

export { execFetchQuery, execInsertQuery };
