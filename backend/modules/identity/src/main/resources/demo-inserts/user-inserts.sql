CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH ranked_users AS (SELECT ref.email,
                             ref.role,
                             row_number() OVER (
                                 PARTITION BY CASE WHEN ref.role = 'USER' THEN 'USER' ELSE 'OTHER' END
                                 ORDER BY ref.email
                                 ) AS user_row_no
                      FROM _config.user_email_reference ref)
INSERT
INTO auth."user" (uuid, email, password, email_confirmed)
SELECT uuid_generate_v5('00000000-0000-0000-0000-000000000000'::uuid, ranked.email),
       ranked.email,
       '$2a$12$GieEihoga8IlbAsO3oE1r.rf5vv2T4/GZMh71ukm8eAz3yxlld5KC',
       CASE
           WHEN ranked.role = 'ADMIN' THEN true
           WHEN ranked.user_row_no <= 5 THEN false
           ELSE true
           END
FROM ranked_users ranked
ON CONFLICT (email) DO NOTHING;

WITH ranked_users AS (SELECT ref.email,
                             ref.role,
                             row_number() OVER (
                                 PARTITION BY CASE WHEN ref.role = 'USER' THEN 'USER' ELSE 'OTHER' END
                                 ORDER BY ref.email
                                 ) AS user_row_no
                      FROM _config.user_email_reference ref)
UPDATE auth."user" u
SET email_confirmed = CASE
                          WHEN ranked.role = 'ADMIN' THEN true
                          WHEN ranked.user_row_no <= 5 THEN false
                          ELSE true
    END
FROM ranked_users ranked
WHERE u.email = ranked.email;

INSERT INTO auth.user_data (uuid, user_id, name, surname)
SELECT gen_random_uuid(),
       u.id,
       split_part(ref.full_name, ' ', 1),
       nullif(trim(substr(ref.full_name, length(split_part(ref.full_name, ' ', 1)) + 1)), '')
FROM _config.user_email_reference ref
         JOIN auth."user" u ON u.email = ref.email
         LEFT JOIN auth.user_data ud ON ud.user_id = u.id
WHERE ud.user_id IS NULL;

INSERT INTO auth.user_roles (user_id, role_id)
SELECT u.id,
       r.id
FROM _config.user_email_reference ref
         JOIN auth."user" u ON u.email = ref.email
         JOIN auth.role r ON r.name = CASE WHEN ref.role = 'ADMIN' THEN 'ROLE_ADMIN' ELSE 'ROLE_USER' END
         LEFT JOIN auth.user_roles ur ON ur.user_id = u.id AND ur.role_id = r.id
WHERE ur.id IS NULL;
