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

### Instructions for the database 
1. A file containing dummy data is already provided (`/database/dummy_data.sql`) but steps 2 and 3 describe how to generate one yourself.
2. `cd` into `/populate_db` and run `npm install`.
3. Run `node fill_db.js <output_name>` where `<output_name>` is the name that will be given to the output file of the process.  
   The output will be an SQL file containing dummy data to be inserted into the database.
   We recommend selecting a filename similar to `../database/dummy_data.sql`,
   meaning inside the `/database` folder as it will make inserting the data easier.
4. `cd` into `/database` and run `node init_db.js <db_username> <db_password> [<data_file_1> <data_file_2> ...]`
   where the first two arguments are the username and the password you use to access MariaDB,
   while the rest are the names of the data files to be inserted in the database. Give the name of the file created on step 2.
5. (Alternative) If you don't want to run the script or if it doesn't work you can parse the SQL
   files one by one using the command `mariadb --user=<db_username> --password=<db_password> < <sql_file>`.
   Start with `schema.sql` and end with the dummy data file. The intermediate order does not matter.

### Instructions for the backend
1. `cd` into `/backend` and run `npm install`.
2. Create a file called `.env` and fill it according to `.env.sample`.  
   If you set `DB_NAME`, be sure to set it as`DB_NAME=slms`, because the database name is hardcoded in the SQL files.
3. Start the app in development mode using `npm run dev` or in production mode using `node app.js`.
4. The app should now be accessible on `http://APP_HOST:APP_PORT/`. Of course `APP_HOST` should be `localhost` when running it locally.

### Notes
* To change the amount of database rows generated for any table, change the values inside the `generate()` function in `/populate_db/generate.js`.
* The dummy data generation script always creates the following users, which are useful for testing the application:
  * Username `admin`, password `admin`, is an admin
  * Username `operator`, password `operator`, is an operator
  * Username `teacher`, password `teacher`, is a teacher
  * Username `student`, password `student`, is a student
