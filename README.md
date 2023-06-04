# School Library Management System
## Group Members (Group 76)
* Dimitrios Georgousis, el19005
* Georgios-Alexios Kapetanakis, el19062
* Ioannis Liolitsas, el19157

## Setup
### Requirements
* node.js (v20.2.0)
* MariaDB (v10.11.3)
* Clone the repository. For the rest of the steps it is assumed that it was cloned in folder `/`.

### Instructions for the backend
1. `cd` into `/backend` and run `npm install`.
2. Create a file called `.env` and fill it according to `.env.sample`.  
   Be sure to set `DB_NAME=slms`, because the database name is hardcoded in the SQL files.
3. Start the app in development mode using `npm run dev` or in production mode using `node app.js`.
4. The app should now be accessible on `http://APP_HOST:APP_PORT/`. Of course `APP_HOST` should be `localhost` when running it locally.

### Instructions for the database
1. `cd` into `/populate_db` and run `npm install`.
2. Run `node fill_db.js <output_name>` where `<output_name>` is the name that will be given to the output of the process.  
   The output will be an SQL file containing dummy data to be inserted into the database.
   We recommend selecting a filename similar to `../database/dummy.sql`,
   meaning inside the `/database` folder as it will make inserting the data easier.
3. `cd` into `/database` and give execution permission for `init_db_unix.sh` or `init_db_windows.bat`, depending on your platform.
4. Run `./init_db.sh <db_username> <db_password> <input_file>` where the first two arguments are the username and the password you use to access MariaDB, while the third is the name of the dummy data file you created on step 2.
5. (Alternative) If you don't want to run the script or if it doesn't work you can parse the SQL files one by one using the command `mariadb --user=<db_username> --password=<db_password> < sql_file.sql`. Start with `schema.sql` and end with the dummy data file. The intermediate order does not matter.
