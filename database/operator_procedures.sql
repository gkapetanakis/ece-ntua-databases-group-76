use slms;

-- 3.2.1 --
/* Browse all books */
drop procedure if exists operator_present_books;
delimiter $$
create procedure operator_present_books(
    in op_username varchar(255),
    in given_title varchar(255),
    in given_category_name varchar(255),
    in given_author_name varchar(255),
    in given_total_copies int unsigned
)
    language sql
    reads sql data
begin
    set @op_school_name = (select operating_school_name from user_operator where username = op_username);
    call browse_school_books(
            @op_school_name,
            given_title,
            given_category_name,
            given_author_name,
            given_total_copies
        );
end $$
delimiter ;

-- 3.2.2 --
/* View all overdue borrowers of the operator's school */
drop procedure if exists find_overdue_borrowers;
delimiter $$
create procedure find_overdue_borrowers(
    in op_username varchar(255),
    in given_first_name varchar(255),
    in given_last_name varchar(255),
    in given_days_overdue int unsigned
)
    language sql
    reads sql data
begin
    set @given_first_name = ifnull(given_first_name, '%');
    set @given_last_name = ifnull(given_last_name, '%');
    set @given_days_overdue = ifnull(given_days_overdue, 0);
    set @op_school_name = (select operating_school_name from user_operator where username = op_username);
    select isbn, au.username, first_name, last_name, timestampdiff(day, due_date, current_date()) as days_overdue
    from app_user au
             join book_borrowing_active as bba on au.username = bba.username
    where school_name = @op_school_name
      and current_date() > due_date
      and au.first_name like @given_first_name
      and au.last_name like @given_last_name
      and timestampdiff(day, due_date, current_date()) >= @given_days_overdue
    order by days_overdue desc;
end $$
delimiter ;

-- 3.2.3 --
/* View the average review score per user and per category */
drop procedure if exists find_avg_review_score;
delimiter $$
create procedure find_avg_review_score(
    in given_username varchar(255),
    in given_category_name varchar(255)
)
    language sql
    reads sql data
begin
    set @given_username = ifnull(given_username, '%');
    set @given_category_name = ifnull(given_category_name, '%');
    select au.username, first_name, last_name, category_name, avg(likert_rating) as avg_rating
    from book_review br
             join app_user au on br.username = au.username
             join book_category_map bcm on br.isbn = bcm.isbn
             join book_category bc on bcm.category_name = bc.name
    where category_name like @given_category_name
      and au.username like @given_username
    group by username, category_name;
end $$
delimiter ;
