//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool, codes } from "../app.js";

export async function getLogin(_req, res) {
    if (res.locals.username) {
        return res.redirect(codes.FOUND, "/");
    }

    return res.status(codes.OK).render("login");
}

export async function getLogout(_req, res) {
    if (!res.locals.username) {
        return res.redirect(codes.UNAUTHORIZED, "/");
    }

    return res.clearCookie("JSONWebToken").redirect(codes.SEE_OTHER, "/");
}

export async function getRegister(_req, res, next) {
    async function fetchSchoolNames() {
        const result = await pool.query("SELECT name FROM school"); // [["NTUA"], ["AUEB"], ...]

        return result.flat(1); // ["NTUA", "AUEB", ...]
    }

    try {
        if (res.locals.username) {
            return res.status(codes.FOUND).redirect("/");
        }

        res.locals.occupations = ["Student", "Teacher"];
        res.locals.schools = await fetchSchoolNames();
        return res.status(codes.OK).render("register");
    } catch (err) {
        return next(err);
    }
}

export async function postLogin(req, res, next) {
    async function fetchUserPasswordAndRoleUnlessDeactivated(username) {
        const conn = await pool.getConnection();

        const firstResult = await conn.query(
            "SELECT password FROM app_user WHERE username = ?",
            [username]
        ); // [[<password>]
        const hashedPassword = firstResult[0][0]; // <password>

        const secondResult = await conn.query(
            "SELECT EXISTS (SELECT * FROM user_administrator WHERE username = ?)",
            [username]
        ); // [[0/1]]

        if (secondResult[0][0]) {
            await conn.release();
            return [hashedPassword, "admin"];
        }

        const thirdResult = await conn.query(
            "SELECT EXISTS (SELECT * FROM user_operator WHERE username = ?)",
            [username]
        ); // [[0/1]]

        if (thirdResult[0][0]) {
            await conn.release();
            return [hashedPassword, "operator"];
        }

        const fourthResult = await conn.query(
            "SELECT deactivated FROM user_teacher WHERE username = ?",
            [username]
        ); // [] or [[true/false]]

        if (fourthResult.length > 0 && fourthResult[0][0]) {
            throw new Error("Account deactivated");
        }

        if (fourthResult.length > 0 && !fourthResult[0][0]) {
            await conn.release();
            return [hashedPassword, "teacher"];
        }

        const fifthResult = await conn.query(
            "SELECT deactivated FROM user_student WHERE username = ?",
            [username]
        ); // [] or [[true/false]]

        if (fifthResult[0][0]) {
            throw new Error("Account deactivated");
        }

        await conn.release();
        return [hashedPassword, "student"];
    }

    const username = req.body.username;
    const password = req.body.password;

    try {
        if (res.locals.username) {
            return res.redirect(codes.CONFLICT, "/");
        }

        const [hashedPassword, role] =
            await fetchUserPasswordAndRoleUnlessDeactivated(username);
        // we don't actually hash passwords
        //const passowrdsMatch = await bcrypt.compare(password, hashedPassword);
        const passowrdsMatch = password === hashedPassword;

        if (!passowrdsMatch) {
            return res.redirect(codes.UNAUTHORIZED, "/login");
        }

        const expiresInSec = 3 * 24 * 60 * 60;
        const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: expiresInSec,
        });

        res.locals.role = role;
        return res
            .cookie("JSONWebToken", token, {
                httpOnly: true,
                maxAge: expiresInSec * 1000,
            })
            .redirect(codes.FOUND, "/");
    } catch (err) {
        if (err.message === "Account deactivated")
            res.locals.failureMessage =
                "Your account has been deactivated. \
                 Contact your school operator for more info.";
        return next(err);
    }
}

export async function postRegister(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const dateOfBirth = req.body.dateOfBirth;
    const occupation = req.body.occupation;
    const school = req.body.school;

    try {
        if (res.locals.username) {
            return res.redirect(codes.FORBIDDEN, "/");
        }

        // if we wanted proper security we would hash the user's password
        //const salt = await bcrypt.genSalt();
        //const hashedPassword = await bcrypt.hash(password, salt);

        res.locals.queryOptions = `INSERT INTO user_${occupation}_pending_approval \
                                   (username, password, first_name, last_name, date_of_birth, belonging_school_name) \
                                   VALUES (?, ?, ?, ?, ?, ?)`;
        res.locals.queryValues = [
            username,
            //hashedPassword,
            password, // use this instead of previous line
            firstName,
            lastName,
            dateOfBirth,
            school,
        ];
        res.locals.successMessage =
            "Registration successful. \
             An operator will need to approve your account before you can log in.";
        res.locals.backUrl = "/";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function postChangeData(req, res, next) {
    async function getUserPassword(username) {
        const result = await pool.query(
            "SELECT password FROM app_user WHERE username = ?",
            [username]
        ); // [[<password>]]
        return result[0][0]; // <password>
    }

    async function updateUserPassword(username, newHashedPassword) {
        await pool.query(
            "UPDATE app_user SET password = ? WHERE username = ?",
            [newHashedPassword, username]
        );
    }

    async function updateTeacherSchool(username, newSchool) {
        await pool.query(
            "UPDATE user_teacher SET belonging_school_name = ? WHERE username = ?",
            [newSchool, username]
        );
    }

    async function updateTeacherDateOfBirth(username, newDateOfBirth) {
        await pool.query(
            "UPDATE user_teacher SET date_of_birth = ? WHERE username = ?",
            [newDateOfBirth, username]
        );
    }

    const username = res.locals.username;
    const oldPassword = req.body?.oldPassword;
    const newPassword = req.body?.newPassword;
    const newSchool = req.body?.newSchool;
    const newDateOfBirth = req.body?.newDateOfBirth;

    try {
        if (!res.locals.username) {
            return res.redirect(codes.UNAUTHORIZED, "/");
        }

        if (newPassword) {
            const oldHashedPassword = await getUserPassword(username);
            // we don't hash passwords
            //const passowrdsMatch = await bcrypt.compare(
            //    oldPassword,
            //    oldHashedPassword
            //);
            const passowrdsMatch = oldPassword === oldHashedPassword;

            if (!passowrdsMatch) {
                return res.redirect(codes.FORBIDDEN, "/account");
            }

            // if we wanted proper security we would hash the user's password
            //const salt = await bcrypt.genSalt();
            //const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const newHashedPassword = newPassword;

            await updateUserPassword(username, newHashedPassword);

            res.locals.successMessage =
                "Password changed successfully. \
                 Please log in with the new password.";
            res.locals.backUrl = "/login";
            res.locals.btnText = "Continue to login page";
            res.clearCookie("JSONWebToken");
        }

        if (res.locals.role === "teacher" && newSchool) {
            await updateTeacherSchool(username, newSchool);

            res.locals.successMessage = "School changed successfully";
            res.locals.backUrl = "/account";
        }

        if (res.locals.role === "teacher" && newDateOfBirth) {
            await updateTeacherDateOfBirth(username, newDateOfBirth);

            res.locals.successMessage = "Date of birth changed successfully";
            res.locals.backUrl = "/account";
        }

        return res.status(codes.OK).render("success");
    } catch (err) {
        return next(err);
    }
}
