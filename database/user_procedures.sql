use slms;

-- 3.3.1 --
/* Browse all books of the user's school */
drop procedure if exists school_member_present_books;
delimiter $$
create procedure school_member_present_books(
    in sm_username varchar(255),
    in given_title varchar(255),
    in given_category varchar(255),
    in given_author_name varchar(255)
)
    language sql
    reads sql data
begin
    set @school_name = (select belonging_school_name
                        from (select username, belonging_school_name
                              from user_teacher
                              union
                              select username, belonging_school_name
                              from user_student) as school_member
                        where username = sm_username);
    call browse_school_books(
            @school_name,
            given_title,
            given_category,
            given_author_name,
            null
        );
end $$
delimiter ;

-- 3.3.2 --
/* View user's borrowing history */
drop procedure if exists school_member_borrowings_showcase;
create procedure school_member_borrowings_showcase(in sm_username varchar(255))
    language sql
    reads sql data
with borrowed_book as (select isbn, borrowing_date
                       from book_borrowing bb
                       where username = sm_username),
     borrowed_book_author as (select bb.isbn,
                                     group_concat(distinct concat(first_name, ' ', last_name) separator
                                                  ', ') as names
                              from borrowed_book bb
                                       join book_author_map bam on bb.isbn = bam.isbn
                                       join book_author ba on bam.author_id = ba.id
                              group by bb.isbn),
     borrowed_book_category as (select bb.isbn, group_concat(distinct bcm.category_name separator ', ') as names
                                from borrowed_book bb
                                         join book_category_map bcm on bb.isbn = bcm.isbn
                                         join book_category bc on bcm.category_name = bc.name
                                group by bb.isbn)
select b.isbn,
       title,
       publisher,
       page_count,
       summary,
       cover,
       language,
       bba.names as authors,
       bbc.names as categories,
       bb.borrowing_date
from book b
         join borrowed_book bb on b.isbn = bb.isbn
         join borrowed_book_author bba on b.isbn = bba.isbn
         join borrowed_book_category bbc on b.isbn = bbc.isbn
order by bb.borrowing_date;
