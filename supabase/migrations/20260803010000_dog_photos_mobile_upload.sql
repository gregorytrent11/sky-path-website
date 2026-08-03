-- Raise the dog-photos bucket size limit back to 5 MB to match the
-- relaxed client-side check, and allow HEIC/HEIF so photos taken directly
-- on an iPhone camera (which some iOS/browser combinations upload without
-- converting to JPEG) aren't rejected by the bucket's MIME allowlist.

update storage.buckets
set file_size_limit = 5242880 -- 5 MB
where id = 'dog-photos';

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
where id = 'dog-photos';
