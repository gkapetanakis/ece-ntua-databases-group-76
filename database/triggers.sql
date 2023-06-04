use slms;

-- a teacher can't be a student
drop trigger if exists new_teacher;
delimiter $$
create trigger new_teacher
    before insert
    on user_teacher
    for each row
begin
    if exists (select student.username
               from user_student as student
               where student.username = new.username) then
        signal sqlstate '45000'
            set message_text = 'Error: Teacher is already a student';
    end if;
end $$
delimiter ;

-- a student can't be an operator or teacher
drop trigger if exists new_student;
delimiter $$
create trigger new_student
    before insert
    on user_student
    for each row
begin
    if exists (select operator.username
               from user_operator as operator
               where operator.username = new.username) then
        signal sqlstate '45000'
            set message_text = 'Error: Student is already an operator';
    elseif exists (select teacher.username
                   from user_teacher as teacher
                   where teacher.username = new.username) then
        signal sqlstate '45000'
            set message_text = 'Error: Student is already a teacher';
    end if;
end $$
delimiter ;

-- checks made before a reservation is created
drop trigger if exists new_reservation_pre_register;
delimiter $$
create trigger new_reservation_pre_register
    before insert
    on book_reservation
    for each row
begin
    if exists (select *
               from book_reservation as bb
               where bb.username = new.username
                 and bb.isbn = new.isbn) then
        signal sqlstate '45000'
            set message_text = 'Error: There is a reservation for this book already pending';
    elseif exists (select *
                   from book_borrowing_active as bba
                   where bba.username = new.username
                     and bba.isbn = new.isbn) then
        signal sqlstate '45000'
            set message_text = 'Error: User has already borrowed this book';
    elseif exists (select *
                   from book_borrowing_active as bba
                   where bba.username = new.username
                     and bba.due_date < current_date()) then
        signal sqlstate '45000'
            set message_text = 'Error: User has an overdue borrowing';
    elseif 2 <= (select count(*)
                 from book_borrowing_active as bba
                 where bba.username = new.username
                   and exists (select *
                               from user_student as us
                               where us.username = new.username)
                 group by username) + (select count(*)
                                       from book_reservation as br
                                       where br.username = new.username
                                         and exists (select *
                                                     from user_student as us
                                                     where us.username = new.username)
                                       group by username) then
        signal sqlstate '45000'
            set message_text = 'Error: Student has reached maximum borrowing capacity';
    elseif 1 <= (select count(*)
                 from book_borrowing_active as bba
                 where bba.username = new.username
                   and exists (select *
                               from user_teacher as ut
                               where ut.username = new.username)
                 group by username) + (select count(*)
                                       from book_reservation as br
                                       where br.username = new.username
                                         and exists (select *
                                                     from user_teacher as ut
                                                     where ut.username = new.username)
                                       group by username) then
        signal sqlstate '45000'
            set message_text = 'Error: Teacher has reached maximum borrowing capacity';
    end if;
end $$
delimiter ;

-- checks made before a borrowing is created
drop trigger if exists book_borrowing_pre_start;
delimiter $$
create trigger book_borrowing_pre_start
    before insert
    on book_borrowing_active
    for each row
begin
    delete
    from book_reservation
    where isbn = new.isbn
      and username = new.username;

    if ((select count(*)
         from book_borrowing_active as bba
         where bba.isbn = new.isbn
           and bba.school_name = new.school_name
         group by isbn) >=
        (select bb.total_copies_count
         from book_belonging as bb
         where bb.isbn = new.isbn
           and bb.school_name = new.school_name)
        ) then
        signal sqlstate '45000'
            set message_text = 'Error: There are no copies of this book available';
    elseif exists (select *
                   from book_borrowing_active as bba
                   where bba.username = new.username
                     and bba.due_date < current_date()) then
        signal sqlstate '45000'
            set message_text = 'Error: User has an overdue borrowing';
    elseif 2 <= (select count(*)
                 from book_borrowing_active as bba
                 where bba.username = new.username
                   and exists (select *
                               from user_student as us
                               where us.username = new.username)
                 group by username) + (select count(*)
                                       from book_reservation as br
                                       where br.username = new.username
                                         and exists (select *
                                                     from user_student as us
                                                     where us.username = new.username)
                                       group by username) then
        signal sqlstate '45000'
            set message_text = 'Error: Student has reached maximum borrowing capacity';
    elseif 1 <= (select count(*)
                 from book_borrowing_active as bba
                 where bba.username = new.username
                   and exists (select *
                               from user_teacher as ut
                               where ut.username = new.username)
                 group by username) + (select count(*)
                                       from book_reservation as br
                                       where br.username = new.username
                                         and exists (select *
                                                     from user_teacher as ut
                                                     where ut.username = new.username)
                                       group by username) then
        signal sqlstate '45000'
            set message_text = 'Error: Teacher has reached maximum borrowing capacity';
    end if;
end $$
delimiter ;

-- when a reservation is created, automatically fill its `school_name` field
drop trigger if exists autofill_reservation_school;
delimiter $$
create trigger autofill_reservation_school
    before insert
    on book_reservation
    for each row
begin
    set @school_name = (select belonging_school_name
                        from user_teacher
                        where username = new.username);
    set @school_name =
            ifnull(@school_name, (select belonging_school_name
                                  from user_student
                                  where username = new.username));
    set new.school_name = @school_name;
end $$
delimiter ;

-- after borrowing a book delete the reservation
drop trigger if exists book_borrowing_after_start;
create trigger book_borrowing_after_start
    after insert
    on book_borrowing_active
    for each row
    delete
    from book_reservation
    where username = new.username
      and school_name = new.school_name
      and isbn = new.isbn;

-- after returning a book delete the book_borrowing_active row
drop trigger if exists book_borrowing_after_end;
create trigger book_borrowing_after_end
    after insert
    on book_borrowing_ended
    for each row
    delete
    from book_borrowing_active
    where username = new.username
      and school_name = new.school_name
      and isbn = new.isbn;

-- after registering a review delete the pending row
drop trigger if exists book_review_after_start;
create trigger book_review_after_start
    after insert
    on book_review
    for each row
    delete
    from book_review_pending_approval
    where isbn = new.isbn
      and username = new.username;

-- after creating an operator delete the pending row
drop trigger if exists user_operator_after_creation;
create trigger user_operator_after_creation
    after insert
    on user_operator
    for each row
    delete
    from user_operator_pending_approval
    where username = new.username;

-- after creating a teacher delete the pending row
drop trigger if exists user_teacher_after_creation;
create trigger user_teacher_after_creation
    after insert
    on user_teacher
    for each row
    delete
    from user_teacher_pending_approval
    where username = new.username;

-- after creating a student delete the pending row
drop trigger if exists user_student_after_creation;
create trigger user_student_after_creation
    after insert
    on user_student
    for each row
    delete
    from user_student_pending_approval
    where username = new.username;

