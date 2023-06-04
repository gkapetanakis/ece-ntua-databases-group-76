use slms;

drop view if exists book_borrowing;
create view book_borrowing as
    select isbn, username, borrowing_date, operator_approver, school_name
    from book_borrowing_active
    union
    select isbn, username, borrowing_date, operator_approver, school_name
    from book_borrowing_ended;
