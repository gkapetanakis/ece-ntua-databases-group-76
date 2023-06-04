use slms;

-- browse books that match the given criteria
-- all parameters are optional EXCEPT `given_school_name`
drop procedure if exists browse_school_books;
delimiter $$
create procedure browse_school_books(
    in given_school_name varchar(255),
    in given_title varchar(255),
    in given_category_name varchar(255),
    in given_author_name varchar(255),
    in given_total_copies int unsigned
)
    language sql
    reads sql data
begin
    set @given_title = ifnull(given_title, '%');
    set @given_category_name = ifnull(given_category_name, '%');
    set @given_author_name = ifnull(given_author_name, '%');
    set @given_total_copies = ifnull(given_total_copies, 0);
    -- isbn and copies of books of the given school that satisfy title constraint and copies count constraint
    with school_book_satisfy_title_and_count
             as (select bb.isbn, total_copies_count
                 from book_belonging bb
                          join book b on bb.isbn = b.isbn
                 where school_name = given_school_name
                   and lower(title) like lower(concat('%', @given_title, '%'))
                   and total_copies_count >= @given_total_copies),
         -- isbn of books that satisfy author constraint
         school_book_satisfy_author
             as (select sbstac.isbn
                 from school_book_satisfy_title_and_count sbstac
                          join book_author_map bam on sbstac.isbn = bam.isbn
                          join book_author ba on bam.author_id = ba.id
                 where lower(concat(first_name, ' ', last_name)) like
                       lower(@given_author_name)
                 group by sbstac.isbn),
         -- isbn of books that satisfy category constraint
         school_book_satisfy_category
             as (select sbstac.isbn
                 from school_book_satisfy_title_and_count sbstac
                          join book_category_map bcm on sbstac.isbn = bcm.isbn
                 where lower(category_name) like lower(@given_category_name)
                 group by sbstac.isbn),
         -- isbn and count of all active borrowings
         school_book_borrowings
             as (select sbstac.isbn, count(*) as active_count
                 from school_book_satisfy_title_and_count sbstac
                          join book_borrowing_active bba on sbstac.isbn = bba.isbn
                 where bba.school_name = @op_school_name
                 group by sbstac.isbn)
    select b.isbn,
           title,
           publisher,
           page_count,
           summary,
           cover,
           language,
           group_concat(distinct concat(a.first_name, ' ', a.last_name) separator ', ') as authors,
           group_concat(distinct bcm.category_name separator ', ')                      as categories,
           (cast(sbstac.total_copies_count as int) -
            cast(coalesce(sbb.active_count, 0) as int))                                 as available_copies
    from book b
             -- get only isbns of books that satisfy the constraints
             join school_book_satisfy_title_and_count sbstac on b.isbn = sbstac.isbn
             join school_book_satisfy_author sbsa on b.isbn = sbsa.isbn
             join school_book_satisfy_category sbsc on b.isbn = sbsc.isbn
             -- get author and category names of authors and categories of books that satisfy the constraints
             join book_author_map bam on sbsa.isbn = bam.isbn
             join book_author a on bam.author_id = a.id
             join book_category_map bcm on sbsc.isbn = bcm.isbn
             left join school_book_borrowings sbb on b.isbn = sbb.isbn
    group by b.isbn;
end $$
delimiter ;

-- create a book and all other entities related to it
drop procedure if exists create_book;
delimiter $$
create procedure create_book(
    in new_isbn varchar(255),
    in new_title varchar(255),
    in new_publisher varchar(255),
    in new_page_count int unsigned,
    in new_summary text,
    in new_cover blob,
    in new_language varchar(255),
    in new_author_first_name varchar(255),
    in new_author_last_name varchar(255),
    in new_category_name varchar(255),
    in new_keyword_name varchar(255),
    in op_username varchar(255),
    in new_copies varchar(255)
)
begin
    start transaction;

    -- create book
    insert into book (isbn, title, publisher, page_count, summary, cover, language)
    values (new_isbn, new_title, new_publisher, new_page_count, new_summary, new_cover, new_language);

    -- create author
    set @author_id = ifnull((select id
                             from book_author
                             where lower(first_name) = lower(new_author_first_name)
                               and lower(last_name) = lower(new_author_last_name)), 'none');
    if @author_id = 'none'
    then
        insert into book_author (first_name, last_name)
        values (new_author_first_name, new_author_last_name);
        set @author_id = last_insert_id();
    end if;
    insert into book_author_map (isbn, author_id)
    values (new_isbn, @author_id);

    -- create category
    if not exists (select name
                   from book_category
                   where lower(name) = lower(new_category_name))
    then
        insert into book_category (name)
        values (new_category_name);
    end if;
    insert into book_category_map (isbn, category_name)
    values (new_isbn, new_category_name);

    -- create keyword
    if not exists (select name
                   from book_keyword
                   where lower(name) = lower(new_keyword_name))
    then
        insert into book_keyword (name)
        values (new_keyword_name);
    end if;
    insert into book_keyword_map (isbn, keyword_name)
    values (new_isbn, new_keyword_name);

    -- create belonging IF a username is given
    if op_username is not null
    then
        set @op_school_name = (select operating_school_name from user_operator where username = op_username);
        insert into book_belonging (isbn, school_name, total_copies_count)
        values (new_isbn, @op_school_name, new_copies);
    end if;

    commit;
end $$
delimiter ;

-- view student/teacher reservations
drop procedure if exists school_member_reservations_showcase;
create procedure school_member_reservations_showcase(in sm_username varchar(255))
    language sql
    reads sql data
with reservation as (select isbn, expiry_date
                     from book_reservation
                     where username = sm_username)
select book.isbn,
       book.title,
       book.publisher,
       book.page_count,
       book.summary,
       book.cover,
       book.language,
       reservation.expiry_date
from reservation
         join book
              on reservation.isbn = book.isbn;

-- get all students/teachers of an operator's school
drop procedure if exists school_member_list;
delimiter $$
create procedure school_member_list(in op_username varchar(255))
    language sql
    reads sql data
begin
    set @op_school_name = (select operating_school_name
                           from user_operator
                           where username = op_username);
    with school_member as (select username, 'teacher' as occupation
                           from user_teacher
                           where belonging_school_name = @op_school_name
                           union
                           select username, 'student' as occupation
                           from user_student
                           where belonging_school_name = @op_school_name)
    select school_member.username,
           school_member.occupation,
           app_user.first_name,
           app_user.last_name
    from school_member
             join app_user on school_member.username = app_user.username;
end $$
delimiter ;

-- get all pending reviews of an operator's school
drop procedure if exists get_school_pending_reviews;
delimiter $$
create procedure get_school_pending_reviews(in op_username varchar(255))
    language sql
    reads sql data
begin
    set @op_school_name = (select operating_school_name
                           from user_operator
                           where username = op_username);
    with school_member as (select username
                           from user_student
                           where belonging_school_name = @op_school_name
                           union
                           select username
                           from user_teacher
                           where belonging_school_name = @op_school_name)
    select brpa.isbn, brpa.username, brpa.text, brpa.likert_rating
    from book_review_pending_approval brpa
             join school_member on brpa.username = school_member.username;
end $$
delimiter ;
