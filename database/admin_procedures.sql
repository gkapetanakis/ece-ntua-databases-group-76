use slms;

-- 3.1.1 --
/* View all borrowings per school in between start_date and end_date */
drop procedure if exists lendings_per_school;
create procedure lendings_per_school(in start_date date, in end_date date)
    language sql
    reads sql data
select school_name, count(*) as book_lendings_count
from book_borrowing
where borrowing_date between start_date and end_date
group by school_name;


-- 3.1.2 --
/* View all authors of a category and all teachers who borrowed
   a book of this category the past year */
drop procedure if exists author_teacher_by_category;
create procedure author_teacher_by_category(in given_category_name varchar(255))
    language sql
    reads sql data
    -- books belonging to the given category
with category_book as (select isbn
                       from book_category_map
                       where category_name = given_category_name),
     -- borrowings made in the past year
     past_year_borrowing as (select username, isbn
                             from book_borrowing
                             where borrowing_date >= date_format(now(), '%Y-01-01')),
     -- users who borrowed books of the given category in the past year
     category_book_borrower as (select username
                                from past_year_borrowing pyb
                                         join category_book cb on pyb.isbn = cb.isbn),
     -- teacher usernames who borrowed books of the given category in the past year
     category_teacher_borrower as (select ut.username
                                   from user_teacher ut
                                            join category_book_borrower cbb on ut.username = cbb.username),
     -- author ids of the given category
     category_author as (select author_id as id
                         from book_author_map bam
                                  join category_book cb on bam.isbn = cb.isbn)
-- author names of the given category
select ba.id as identification, first_name, last_name, 'author' as occupation
from book_author ba
         join category_author ca on ba.id = ca.id
union
-- teacher names who borrowed books of that category in the past year
select au.username as identification, first_name, last_name, 'teacher' as occupation
from app_user au
         join category_teacher_borrower ctb on au.username = ctb.username;

-- 3.1.3 --
/* View all teachers less than max_age years old who have borrowed the most books,
   and the number of books they have borrowed */
drop procedure if exists find_young_teachers;
create procedure find_young_teachers(in max_age int)
    language sql
    reads sql data
-- teachers less than `max_age` years old
with young_teacher as (select username
                       from user_teacher
                       where date_of_birth > date_sub(current_date, interval max_age year)),
     -- borrowings of young teachers
     young_teacher_borrowing as (select yt.username
                                 from book_borrowing bb
                                          join young_teacher yt on bb.username = yt.username),
     -- borrowings count of young teachers
     young_teacher_borrowing_count as (select ytb.username, count(*) as borrowing_count
                                       from young_teacher_borrowing ytb
                                       group by ytb.username),
     -- borrowings of the teachers with the maximum borrowings
     young_teacher_max_borrower as (select username, max(borrowing_count) as max_borrowing_count
                                    from young_teacher_borrowing_count
                                    group by username)
select au.username,
       au.first_name,
       au.last_name,
       ytmb.max_borrowing_count
from young_teacher_max_borrower ytmb
         join app_user au on au.username = ytmb.username;

-- 3.1.4 --
/* View all authors whose books have never been borrowed */
drop procedure if exists find_unpopular_authors;
create procedure find_unpopular_authors()
    language sql
    reads sql data
-- author ids of authors without borrowings
with unpopular_author as (select distinct author_id as id
                          from book_author_map bam
                                   left join book_borrowing bb on bam.isbn = bb.isbn
                          group by id
                          having count(bb.isbn) = 0)
select ba.id, ba.first_name, ba.last_name
from unpopular_author ua
         join book_author ba on ba.id = ua.id;

-- 3.1.5 --
/* View all operators with more than 20 approvals that have
   approved the same number of borrowings in the year year_no */
drop procedure if exists find_high_value_operators;
create procedure find_high_value_operators(in year_no int)
    language sql
    reads sql data
select operator_approver as username, count(*) as approvals_count
from book_borrowing bb
where year(bb.borrowing_date) = year_no
group by operator_approver
having approvals_count > 20
order by approvals_count desc;

-- 3.1.6 --
/* View the top pair_cnt most common genre pairs in borrowings */
drop procedure if exists find_most_popular_category_pairs;
create procedure find_most_popular_category_pairs(in pair_cnt int)
    language sql
    reads sql data
-- all category pairs (no permutations)
with book_category_pair as (select bcm1.isbn,
                                   bcm1.category_name as category1,
                                   bcm2.category_name as category2
                            from book_category_map as bcm1
                                     join book_category_map as bcm2
                                          on bcm1.isbn = bcm2.isbn
                            where bcm1.category_name < bcm2.category_name),
     book_borrowing_count as (select isbn, count(*) as borrowings_count
                              from book_borrowing
                              group by isbn)
select bcp.category1, bcp.category2, borrowings_count
from book_borrowing_count bbc
         join book_category_pair bcp on bbc.isbn = bcp.isbn
order by bbc.borrowings_count desc
limit pair_cnt;

-- 3.1.7 --
/* View all authors who have written at least `book_dif` books
   less than the author with the most books written */
drop procedure if exists authors_with_some_books_less_than_top;
create procedure authors_with_some_books_less_than_top(in book_dif int)
    language sql
    reads sql data
-- number of books written by each author
with author_book_count as (select author_id, count(*) as book_count
                           from book_author_map
                           group by author_id),
     -- most books written by an author
     most_written_book as (select max(book_count) as count
                           from author_book_count
                           limit 1),
     -- id of the requested authors
     requested_author as (select author_id as id, book_count
                          from author_book_count
                          where book_count <= ((select count from most_written_book) - book_dif))
select ba.id, first_name, last_name, book_count
from requested_author ra
         join book_author ba on ra.id = ba.id
order by book_count desc;
