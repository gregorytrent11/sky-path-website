-- Lower the dog-photos and dog-videos bucket size limits to match the
-- tightened client-side checks (2.5 MB per photo, 5 MB per video).

update storage.buckets
set file_size_limit = 2621440 -- 2.5 MB
where id = 'dog-photos';

update storage.buckets
set file_size_limit = 5242880 -- 5 MB
where id = 'dog-videos';
