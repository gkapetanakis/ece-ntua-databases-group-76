# SchoolLib
SchoolLib is a simple school library management system heavily utilizing an SQL database. It was created as part of the Databases class of the [School of Electrical and Computer Engineering](https://www.ece.ntua.gr/en) of the [National Technical University of Athens](https://ntua.gr/en/) during the academic year 2022-2023.

#### Contributors
* Dimitris Georgousis
* George Kapetanakis (me)
* Giannis Liolitsas

#### Grade
The project was graded with a 10 out of 10.

## Setup Guide
### Requirements
* Node.js (v20.2.0)
* MariaDB (v10.11.3)

### Installation Instructions
* Clone repository wherever you want (e.g. `./`).

#### Back-end service
1. `cd` into `./backend` and run `npm install`.
2. Create a file called `.env` and fill it according to `.env.sample`.  
   Be sure to set `DB_NAME=slms`, because the database name is hardcoded in the SQL files.
3. Start the app in development mode using `npm run dev` or in production mode using `node app.js`.
4. The app should now be accessible on `http://APP_HOST:APP_PORT/`. Of course `APP_HOST` should be `localhost` when running locally.

#### Database
1. `cd` into `./populate_db` and run `npm install`.
2. Run `node fill_db.js <output_name>` where `<output_name>` is the name that will be given to the output file of the process.  
   The output will be an SQL file containing dummy data to be inserted into the database.
   We recommend selecting a filename similar to `../database/dummy_data.sql`,
   meaning inside the `./database` folder as it will make inserting the data easier.
3. `cd` into `./database` and give execution permission for `init_db.sh` (i.e. `chmod +x init_db.sh`).
4. Run `node init_db.js <db_username> <db_password> [<data_file_1> <data_file_2> ...]`
   where the first two arguments are the username and the password you use to access MariaDB,
   while the rest are the names of the data files to be inserted in the database. Give the name of the file created on step 2.
6. (Alternative) If you don't want to run the script or if it doesn't work you can parse the SQL
   files one by one using the command `mariadb --user=<db_username> --password=<db_password> < sql_file.sql`.
   Start with `schema.sql` and end with the dummy data file. The intermediate order does not matter.

#### Notes
* To change the amount of database rows generated for any table, change the values inside the `generate()` function in `./populate_db/generate.js`.
* The dummy data generation script always creates the following users, which are useful for testing the application:
  * Username `admin`, password `admin`, is an admin
  * Username `operator`, password `operator`, is an operator
  * Username `teacher`, password `teacher`, is a teacher
  * Username `student`, password `student`, is a student
