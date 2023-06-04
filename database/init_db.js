const { execSync } = require("child_process");

if (process.argv[3] == undefined) {
    console.log(
        "Usage: node init_db.js <db_username> <db_password> [<data_file_1> <data_file_2> ...]"
    );
    process.exit(0);
}

const dbUser = process.argv[2];
const dbPass = process.argv[3];

execSync(`mariadb --user=${dbUser} --password=${dbPass} < schema.sql`);
console.log("Database created");
execSync(`mariadb --user=${dbUser} --password=${dbPass} < views.sql`);
console.log("Views created");
execSync(`mariadb --user=${dbUser} --password=${dbPass} < events.sql`);
console.log("Events created");
execSync(`mariadb --user=${dbUser} --password=${dbPass} < triggers.sql`);
console.log("Triggers created");
execSync(
    `mariadb --user=${dbUser} --password=${dbPass} < general_procedures.sql`
);
console.log("General procedures created");
execSync(
    `mariadb --user=${dbUser} --password=${dbPass} < admin_procedures.sql`
);
console.log("Admin procedures created");
execSync(
    `mariadb --user=${dbUser} --password=${dbPass} < operator_procedures.sql`
);
console.log("Operator procedures created");
execSync(`mariadb --user=${dbUser} --password=${dbPass} < user_procedures.sql`);
console.log("User procedures created");

for (const inFile of process.argv.slice(4, process.argv.length)) {
    execSync(`mariadb --user=${dbUser} --password=${dbPass} < ${inFile}`);
    console.log(`Data from '${inFile}' inserted into database`);
}

console.log("Everything done");
