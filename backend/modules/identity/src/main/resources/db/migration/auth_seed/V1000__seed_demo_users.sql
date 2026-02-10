CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO
$$
    DECLARE
        admin_users TEXT[][] := ARRAY [
            ['alice.johnson@example.com', 'Alice Johnson'],
            ['bob.smith@example.com', 'Bob Smith'],
            ['carol.williams@example.com', 'Carol Williams'],
            ['david.jones@example.com', 'David Jones'],
            ['eva.brown@example.com', 'Eva Brown']
            ];
        i           INT;
        new_user_id BIGINT;
    BEGIN
        FOR i IN 1..array_length(admin_users, 1)
            LOOP
                INSERT INTO auth."user" (uuid, email, password)
                VALUES (gen_random_uuid(), admin_users[i][1], '$2a$12$GieEihoga8IlbAsO3oE1r.rf5vv2T4/GZMh71ukm8eAz3yxlld5KC')
                RETURNING id INTO new_user_id;

                INSERT INTO auth.user_data (uuid, user_id, full_name)
                VALUES (gen_random_uuid(), new_user_id, admin_users[i][2]);

                INSERT INTO auth.user_roles (user_id, role_id)
                VALUES (new_user_id, 1); -- ROLE_ADMIN
            END LOOP;
    END
$$;

-- Insert regular users
DO
$$
    DECLARE
        names       TEXT[] := ARRAY [
            'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Isabella Taylor', 'Jack Anderson',
            'Karen Thomas', 'Leo Jackson', 'Mia White', 'Noah Harris', 'Olivia Martin',
            'Paul Thompson', 'Quinn Garcia', 'Ruby Martinez', 'Sam Robinson', 'Tina Clark',
            'Uma Rodriguez', 'Victor Lewis', 'Wendy Lee', 'Xander Walker', 'Yara Hall',
            'Zane Allen', 'Amy Young', 'Brian King', 'Chloe Wright', 'Dylan Scott',
            'Ella Green', 'Finn Adams', 'Gina Baker', 'Harry Nelson', 'Ivy Carter',
            'Jake Mitchell', 'Kylie Perez', 'Liam Roberts', 'Megan Turner', 'Nathan Phillips',
            'Oscar Campbell', 'Piper Parker', 'Quentin Evans', 'Rachel Edwards', 'Sean Collins',
            'Tara Stewart', 'Uriel Sanchez', 'Violet Morris', 'Will Rogers', 'Xenia Reed'
            ];
        i           INT;
        full_name   TEXT;
        email       TEXT;
        new_user_id BIGINT;
    BEGIN
        FOR i IN 1..array_length(names, 1)
            LOOP
                full_name := names[i];
                email := lower(replace(full_name, ' ', '.')) || '@example.com';

                INSERT INTO auth."user" (uuid, email, password, email_confirmed)
                VALUES (gen_random_uuid(), email, '$2a$12$GieEihoga8IlbAsO3oE1r.rf5vv2T4/GZMh71ukm8eAz3yxlld5KC', true)
                RETURNING id INTO new_user_id;

                INSERT INTO auth.user_data (uuid, user_id, full_name)
                VALUES (gen_random_uuid(), new_user_id, full_name);

                INSERT INTO auth.user_roles (user_id, role_id)
                VALUES (new_user_id, 2); -- ROLE_USER
            END LOOP;
    END
$$;
