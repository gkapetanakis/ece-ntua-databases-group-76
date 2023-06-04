import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mariadb from "mariadb";

import { verifyAdmin } from "./middleware/admin.js";
import { verifyOperator } from "./middleware/operator.js";

import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import operatorRouter from "./routes/operator.js";
import userRouter from "./routes/user.js";

// http codes
const codes = {
    OK: 200,
    CREATED: 201,
    FOUND: 302,
    SEE_OTHER: 303,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

// load env variables
dotenv.config();
console.log("Loaded the .env variables");

// create a connection pool (10 connections by default)
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME ?? "slms",
    rowsAsArray: true, // [[row1_val1, row1_val2, ...], [row2_val1, row2_val2, ...], ...]
    bigIntAsNumber: true, // sqls bigint type converts to a javascript number automatically
    dateStrings: "date", // 'YYYY-MM-DD'
});

// create and configure the express app
const app = express();
app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(identifyPage);
app.use(authenticateUser);
app.use("/", authRouter);
app.use("/admin", verifyAdmin, adminRouter);
app.use("/operator", verifyOperator, operatorRouter);
app.use("/", userRouter);
// error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err);
    if (!res.locals.failureMessage)
        res.locals.failureMessage = "Internal server error";
    if (!res.locals.backUrl) res.locals.backUrl = "/";
    res.status(codes.INTERNAL_SERVER_ERROR).render("failure");
});

function identifyPage(req, res, next) {
    // set the correct variable to highlight the correct nav link in the frontend
    switch (req.path) {
        case "/":
            res.locals.index = true;
            break;
        case "/about":
            res.locals.about = true;
            break;
        case "/login":
            res.locals.login = true;
            break;
        case "/register":
            res.locals.register = true;
            break;
        case "/account":
            res.locals.account = true;
            break;
    }
    return next();
}

async function authenticateUser(req, res, next) {
    async function fetchUserRole(username) {
        const conn = await pool.getConnection();
        const firstResult = await conn.query(
            "SELECT EXISTS (SELECT * FROM user_administrator WHERE username = ?)",
            [username]
        ); // [[0/1]]

        if (firstResult[0][0]) {
            await conn.release();
            return "admin";
        }

        const secondResult = await conn.query(
            "SELECT EXISTS (SELECT * FROM user_operator WHERE username = ?)",
            [username]
        ); // [[0/1]]

        if (secondResult[0][0]) {
            await conn.release();
            return "operator";
        }

        const thirdResult = await conn.query(
            "SELECT EXISTS (SELECT * FROM user_teacher WHERE username = ?)",
            [username]
        ); // [[0/1]]

        await conn.release();
        return thirdResult[0][0] ? "teacher" : "student";
    }

    try {
        const token = req.cookies.JSONWebToken;
        if (!token) {
            return next(); // user is not logged in
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded.username) {
            return next(); // token is invalid
        }

        res.locals.username = decoded.username; // user is logged in
        res.locals.role = await fetchUserRole(decoded.username);
        return next();
    } catch (err) {
        return next(err);
    }
}

app.get("/", async (_req, res) => {
    async function fetchCategories() {
        const result = await pool.query("SELECT name FROM book_category"); // [["horror"], ["fiction"], ...]

        return result.flat(1); // ["horror", "fiction", ...]
    }

    if (res.locals.username) {
        try {
            res.locals.categories = await fetchCategories();
        } catch (err) {
            console.error(
                "/: Error fetching the book categories from the database"
            );
        }
    }

    res.status(codes.OK).render("index");
});

app.get("/about", (_req, res) => {
    res.status(codes.OK).render("about");
});

app.get("/account", async (_req, res) => {
    if (!res.locals.username) {
        return res.redirect(codes.UNAUTHORIZED, "/");
    }

    if (res.locals.role === "teacher") {
        try {
            const result = await pool.query("SELECT name FROM school"); // [[...], [...], ...]
            res.locals.schools = result.flat(1);
        } catch (err) {
            console.log("/account: Error fetching school names");
        }
    }

    res.status(codes.OK).render("account");
});

// start listening for incoming connections
app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
    console.log("App is now listening on port 3000");
});

export { pool, codes };
