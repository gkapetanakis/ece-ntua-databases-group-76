import { faker } from "@faker-js/faker";
import { getRandomElement } from "./utils.js";

const usernames = [];
const operatedSchools = [];

function getRandomBirthdate(minAge, maxAge) {
    return faker.date
        .birthdate({
            min: minAge,
            max: maxAge,
            mode: "age",
        })
        .toISOString()
        .slice(0, 10); // 'YYYY-MM-DD'
}

function generateAppUser(username) {
    let preset =
        username === "admin" ||
        username === "operator" ||
        username === "teacher" ||
        username === "student";
    return {
        username: username,
        password: preset ? username : faker.internet.password(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
    };
}

function generateTeachersStudents(n, minAge, maxAge, nUnapproved, schoolNames) {
    if (minAge < 0 || maxAge < 0)
        throw new Error("minAge and maxAge must not be negative");
    if (schoolNames.length < 1)
        throw new Error("At least one school name must exist");

    const genUsers = [];

    let maxLoops = 1.5 * n;
    while (n > 0 && maxLoops--) {
        const newUsername = faker.internet.userName();
        if (usernames.includes(newUsername)) continue;
        usernames.push(newUsername);

        const newUser = {
            username: newUsername,
            belonging_school_name: getRandomElement(schoolNames),
            date_of_birth: getRandomBirthdate(minAge, maxAge),
        };

        if (nUnapproved-- > 0) {
            newUser.password = faker.internet.password();
            newUser.first_name = faker.person.firstName();
            newUser.last_name = faker.person.lastName();
        } else {
            newUser.deactivated = faker.number.float() < 0.1 ? true : false;
        }

        genUsers.push(newUser);
        --n;
    }

    return genUsers;
}

// ----- API ----- //

function generateAdministrators(n) {
    const genAdmins = [];

    let maxLoops = 1.5 * n;
    let firstLoop = true;
    while (n > 0 && maxLoops--) {
        const newUsername = firstLoop ? "admin" : faker.internet.userName();
        firstLoop = false;
        if (usernames.includes(newUsername)) continue;
        usernames.push(newUsername);

        genAdmins.push({
            username: newUsername,
        });
        --n;
    }

    for (const admin of genAdmins) {
        adminUsers.push(admin);
        appUsers.push(generateAppUser(admin.username));
    }
}

function generateOperators(nUnapproved, schoolNames) {
    if (schoolNames.length < 1)
        throw new Error("At least one school name must exist");

    const genOperators = [];

    let firstLoop = true;
    let nUnapprovedTemp = nUnapproved;
    for (const schoolName of schoolNames) {
        const newUsername = firstLoop ? "operator" : faker.internet.userName();
        firstLoop = false;
        if (operatedSchools.includes(schoolName)) continue;
        usernames.push(newUsername);
        operatedSchools.push(schoolName);

        const newOperator = {
            username: newUsername,
            operating_school_name: schoolName,
        };

        if (newUsername !== "operator" && nUnapprovedTemp-- > 0) {
            newOperator.password = faker.internet.password();
            newOperator.first_name = faker.person.firstName();
            newOperator.last_name = faker.person.lastName();
        }

        genOperators.push(newOperator);
    }

    nUnapprovedTemp = nUnapproved;
    for (const operator of genOperators) {
        if (operator.username !== "operator" && nUnapprovedTemp-- > 0) {
            unapprovedOperatorUsers.push(operator);
        } else {
            operatorUsers.push(operator);
            appUsers.push(generateAppUser(operator.username));
        }
    }
}

function generateTeachers(n, minAge, maxAge, nUnapproved, schoolNames) {
    const genTeachers = [
        {
            username: "teacher",
            belonging_school_name: schoolNames[0],
            date_of_birth: "1980-01-01",
            deactivated: false,
        },
        ...generateTeachersStudents(
            n,
            minAge,
            maxAge,
            nUnapproved,
            schoolNames
        ),
    ];

    for (const teacher of genTeachers) {
        if (teacher.username !== "teacher" && nUnapproved-- > 0) {
            unapprovedTeacherUsers.push(teacher);
        } else {
            schoolUsers.push(teacher);
            teacherUsers.push(teacher);
            appUsers.push(generateAppUser(teacher.username));
        }
    }
}

function generateStudents(n, minAge, maxAge, nUnapproved, schoolNames) {
    const genStudents = [
        {
            username: "student",
            belonging_school_name: schoolNames[0],
            date_of_birth: "2006-01-01",
            deactivated: false,
        },
        ...generateTeachersStudents(
            n,
            minAge,
            maxAge,
            nUnapproved,
            schoolNames
        ),
    ];

    for (const student of genStudents) {
        if (student.username !== "student" && nUnapproved-- > 0) {
            unapprovedStudentUsers.push(student);
        } else {
            schoolUsers.push(student);
            studentUsers.push(student);
            appUsers.push(generateAppUser(student.username));
        }
    }
}

const appUsers = [];
const adminUsers = [];
const operatorUsers = [];
const teacherUsers = [];
const studentUsers = [];
const schoolUsers = [];
const unapprovedOperatorUsers = [];
const unapprovedTeacherUsers = [];
const unapprovedStudentUsers = [];

export {
    generateAdministrators,
    generateOperators,
    generateTeachers,
    generateStudents,
    appUsers,
    adminUsers,
    operatorUsers,
    teacherUsers,
    studentUsers,
    schoolUsers,
    unapprovedOperatorUsers,
    unapprovedTeacherUsers,
    unapprovedStudentUsers,
};
