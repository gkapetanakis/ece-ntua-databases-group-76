drop schema if exists slms; -- school library management system
create database slms
    character set = "utf8mb4"
    collate = "utf8mb4_unicode_ci";
use slms;

-- school related tables

create table school
(
    name                 varchar(255) not null,
    street_name          varchar(255) not null,
    street_number        int unsigned not null,
    postal_code          char(5)      not null check (postal_code regexp '^[1-9][0-9]{4}$'),
    city                 varchar(255) not null,
    principal_first_name varchar(255) not null,
    principal_last_name  varchar(255) not null,
    primary key (name)
);

create table school_email_address
(
    school_name varchar(255) not null,
    address     varchar(255) not null check (address like '_%@_%._%'),
    primary key (school_name, address),
    constraint fk_school_email_school_name
        foreign key (school_name) references school (name)
            on delete cascade
            on update cascade
);

create table school_phone_number
(
    school_name varchar(255) not null,
    number      varchar(10)  not null check (number regexp '^[0-9]{10}$'),
    primary key (school_name, number),
    constraint fk_school_phone_number_school_name
        foreign key (school_name) references school (name)
            on delete cascade
            on update cascade
);

-- user related tables

create table app_user
(
    username   varchar(255) not null,
    password   varchar(255) not null,
    first_name varchar(255) not null,
    last_name  varchar(255) not null,
    primary key (username)
);

create table user_administrator
(
    username varchar(255) not null,
    primary key (username),
    constraint fk_administrator_username
        foreign key (username) references app_user (username)
);

create table user_operator
(
    username              varchar(255) not null,
    operating_school_name varchar(255),
    primary key (username),
    constraint fk_operator_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade,
    constraint fk_operator_school
        foreign key (operating_school_name) references school (name)
            on delete set null
            on update cascade,

    index (operating_school_name)
);

create table user_student
(
    username              varchar(255)          not null,
    belonging_school_name varchar(255)          not null,
    date_of_birth         date                  not null,
    deactivated           boolean default false not null,
    primary key (username),
    constraint fk_student_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade,
    constraint fk_student_belonging_school_name
        foreign key (belonging_school_name) references school (name)
            on update cascade,

    index (belonging_school_name)
);

create table user_teacher
(
    username              varchar(255)          not null,
    belonging_school_name varchar(255)          not null,
    date_of_birth         date                  not null,
    deactivated           boolean default false not null,
    primary key (username),
    constraint fk_teacher_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade,
    constraint fk_teacher_belonging_school_name
        foreign key (belonging_school_name) references school (name)
            on update cascade,

    index (belonging_school_name)
);

create table user_operator_pending_approval
(
    username              varchar(255) not null,
    password              varchar(255) not null,
    first_name            varchar(255) not null,
    last_name             varchar(255) not null,
    operating_school_name varchar(255) not null,
    primary key (username),
    constraint fk_operator_pending_school
        foreign key (operating_school_name) references school (name)
            on delete cascade
            on update cascade,

    index (operating_school_name)
);

create table user_teacher_pending_approval
(
    username              varchar(255) not null,
    password              varchar(255) not null,
    first_name            varchar(255) not null,
    last_name             varchar(255) not null,
    belonging_school_name varchar(255) not null,
    date_of_birth         date         not null,
    primary key (username),
    constraint fk_teacher_pending_school
        foreign key (belonging_school_name) references school (name)
            on delete cascade
            on update cascade,

    index (belonging_school_name)
);

create table user_student_pending_approval
(
    username              varchar(255) not null,
    password              varchar(255) not null,
    first_name            varchar(255) not null,
    last_name             varchar(255) not null,
    belonging_school_name varchar(255) not null,
    date_of_birth         date         not null,
    primary key (username),
    constraint fk_student_pending_school
        foreign key (belonging_school_name) references school (name)
            on delete cascade
            on update cascade,

    index (belonging_school_name)
);

-- books related tables --

create table book_author
(
    id         int unsigned auto_increment,
    first_name varchar(255) not null,
    last_name  varchar(255) not null,
    primary key (id)
);

create table book_category
(
    name varchar(255) not null,
    primary key (name)
);

create table book_keyword
(
    name varchar(255) not null,
    primary key (name)
);

create table book
(
    isbn       char(13)     not null check (isbn regexp '^[0-9]{12}[0-9xX]$'),
    title      varchar(255) not null,
    publisher  varchar(255) not null,
    page_count int unsigned not null,
    summary    text         not null,
    cover      blob,
    language   varchar(255) not null,
    primary key (isbn)
);

create table book_author_map
(
    isbn      char(13)     not null,
    author_id int unsigned not null,
    primary key (isbn, author_id),
    constraint fk_book_author_isbn
        foreign key (isbn) references book (isbn)
            on delete cascade
            on update cascade,
    constraint fk_book_author_id
        foreign key (author_id) references book_author (id)
            on delete cascade
            on update cascade
);

create table book_category_map
(
    isbn          char(13)     not null,
    category_name varchar(255) not null,
    primary key (isbn, category_name),
    constraint fk_book_category_isbn
        foreign key (isbn) references book (isbn)
            on delete cascade
            on update cascade,
    constraint fk_book_category_name
        foreign key (category_name) references book_category (name)
            on delete cascade
            on update cascade
);

create table book_keyword_map
(
    isbn         char(13)     not null,
    keyword_name varchar(255) not null,
    primary key (isbn, keyword_name),
    constraint fk_book_keyword_isbn
        foreign key (isbn) references book (isbn)
            on delete cascade
            on update cascade,
    constraint fk_book_keyword_name
        foreign key (keyword_name) references book_keyword (name)
            on delete cascade
            on update cascade
);

create table book_belonging
(
    isbn               char(13)     not null,
    school_name        varchar(255) not null,
    total_copies_count int unsigned not null,
    primary key (isbn, school_name),
    constraint fk_book_belonging_isbn
        foreign key (isbn) references book (isbn)
            on delete restrict
            on update cascade
);

create table book_reservation
(
    isbn        char(13)     not null,
    username    varchar(255) not null,
    expiry_date date         not null default date_add(current_date(), interval 1 week),
    school_name varchar(255) not null,
    primary key (isbn, username),
    constraint fk_reservation_isbn
        foreign key (isbn) references book (isbn)
            on delete cascade
            on update cascade,
    constraint fk_reservation_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade,
    constraint fk_reservation_school_name
        foreign key (school_name) references school (name)
            on delete cascade
            on update cascade,

    index (school_name)
);

create table book_borrowing_active
(
    isbn              char(13)                                               not null,
    username          varchar(255)                                           not null,
    borrowing_date    date default current_date()                            not null,
    due_date          date default date_add(current_date(), interval 1 week) not null,
    operator_approver varchar(255)                                           not null,
    school_name       varchar(255)                                           not null,
    primary key (isbn, username),
    constraint fk_borrowing_active_isbn
        foreign key (isbn) references book (isbn)
            on update cascade,
    constraint fk_borrowing_active_username
        foreign key (username) references app_user (username)
            on update cascade,
    constraint fk_borrowing_active_operator
        foreign key (operator_approver) references user_operator (username)
            on update cascade,
    constraint fk_borrowing_active_school
        foreign key (school_name) references school (name)
            on update cascade,

    index (school_name)
);

create table book_borrowing_ended
(
    isbn              char(13)     not null,
    username          varchar(255) not null,
    borrowing_date    date         not null,
    operator_approver varchar(255) not null,
    school_name       varchar(255) not null,
    primary key (isbn, username, borrowing_date),
    constraint fk_borrowing_ended_isbn
        foreign key (isbn) references book (isbn)
            on update cascade,
    constraint fk_borrowing_ended_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade,
    constraint fk_borrowing_ended_operator
        foreign key (operator_approver) references user_operator (username)
            on delete cascade
            on update cascade,
    constraint fk_borrowing_ended_school
        foreign key (school_name) references school (name)
            on delete cascade
            on update cascade,

    index (school_name)
);

create table book_review
(
    isbn          char(13)             not null,
    username      varchar(255)         not null,
    text          text,
    likert_rating enum (
        'strongly recommend',
        'recommend',
        'neutral',
        'do not recommend',
        'strongly do not recommend') not null,
    primary key (isbn, username),
    constraint fk_book_review_isbn
        foreign key (isbn) references book (isbn)
            on update cascade,
    constraint fk_book_review_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade
);

create table book_review_pending_approval
(
    isbn          char(13)             not null,
    username      varchar(255)         not null,
    text          text,
    likert_rating enum (
        'strongly recommend',
        'recommend',
        'neutral',
        'do not recommend',
        'strongly do not recommend') not null,
    primary key (isbn, username),
    constraint fk_book_review_pending_isbn
        foreign key (isbn) references book (isbn)
            on delete cascade
            on update cascade,
    constraint fk_book_review_pending_username
        foreign key (username) references app_user (username)
            on delete cascade
            on update cascade
);
