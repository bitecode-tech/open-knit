CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS _config;

CREATE TABLE IF NOT EXISTS _config.user_email_reference
(
    email     TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role      TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER'))
);

INSERT INTO _config.user_email_reference (email, full_name, role)
VALUES ('admin@bitecode.tech', 'Admin', 'ADMIN'),
       ('frank.miller@example.com', 'Frank Miller', 'USER'),
       ('grace.wilson@example.com', 'Grace Wilson', 'USER'),
       ('henry.moore@example.com', 'Henry Moore', 'USER'),
       ('isabella.taylor@example.com', 'Isabella Taylor', 'USER'),
       ('jack.anderson@example.com', 'Jack Anderson', 'USER'),
       ('karen.thomas@example.com', 'Karen Thomas', 'USER'),
       ('leo.jackson@example.com', 'Leo Jackson', 'USER'),
       ('mia.white@example.com', 'Mia White', 'USER'),
       ('noah.harris@example.com', 'Noah Harris', 'USER'),
       ('olivia.martin@example.com', 'Olivia Martin', 'USER'),
       ('paul.thompson@example.com', 'Paul Thompson', 'USER'),
       ('quinn.garcia@example.com', 'Quinn Garcia', 'USER'),
       ('ruby.martinez@example.com', 'Ruby Martinez', 'USER'),
       ('sam.robinson@example.com', 'Sam Robinson', 'USER'),
       ('tina.clark@example.com', 'Tina Clark', 'USER'),
       ('uma.rodriguez@example.com', 'Uma Rodriguez', 'USER'),
       ('victor.lewis@example.com', 'Victor Lewis', 'USER'),
       ('wendy.lee@example.com', 'Wendy Lee', 'USER'),
       ('xander.walker@example.com', 'Xander Walker', 'USER'),
       ('yara.hall@example.com', 'Yara Hall', 'USER'),
       ('zane.allen@example.com', 'Zane Allen', 'USER'),
       ('amy.young@example.com', 'Amy Young', 'USER'),
       ('brian.king@example.com', 'Brian King', 'USER'),
       ('chloe.wright@example.com', 'Chloe Wright', 'USER'),
       ('dylan.scott@example.com', 'Dylan Scott', 'USER'),
       ('ella.green@example.com', 'Ella Green', 'USER'),
       ('finn.adams@example.com', 'Finn Adams', 'USER'),
       ('gina.baker@example.com', 'Gina Baker', 'USER'),
       ('harry.nelson@example.com', 'Harry Nelson', 'USER'),
       ('ivy.carter@example.com', 'Ivy Carter', 'USER'),
       ('jake.mitchell@example.com', 'Jake Mitchell', 'USER'),
       ('kylie.perez@example.com', 'Kylie Perez', 'USER'),
       ('liam.roberts@example.com', 'Liam Roberts', 'USER'),
       ('megan.turner@example.com', 'Megan Turner', 'USER'),
       ('nathan.phillips@example.com', 'Nathan Phillips', 'USER'),
       ('oscar.campbell@example.com', 'Oscar Campbell', 'USER'),
       ('piper.parker@example.com', 'Piper Parker', 'USER'),
       ('quentin.evans@example.com', 'Quentin Evans', 'USER'),
       ('rachel.edwards@example.com', 'Rachel Edwards', 'USER'),
       ('sean.collins@example.com', 'Sean Collins', 'USER'),
       ('tara.stewart@example.com', 'Tara Stewart', 'USER'),
       ('uriel.sanchez@example.com', 'Uriel Sanchez', 'USER'),
       ('violet.morris@example.com', 'Violet Morris', 'USER'),
       ('will.rogers@example.com', 'Will Rogers', 'USER'),
       ('xenia.reed@example.com', 'Xenia Reed', 'USER')
ON CONFLICT (email) DO NOTHING;
