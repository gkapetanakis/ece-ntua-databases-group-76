use slms;

-- delete expired reservations every day --
drop event if exists delete_expired_reservations;
create event delete_expired_reservations
    on schedule every 1 day do
    delete
    from book_reservation
    where expiry_date < current_date();
