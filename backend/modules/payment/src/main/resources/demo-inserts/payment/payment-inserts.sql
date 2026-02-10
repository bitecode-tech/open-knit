CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH seed_source AS (SELECT u.uuid                                                                                    AS user_uuid,
                            u.email,
                            uuid_generate_v5('00000000-0000-0000-0000-000000000000'::uuid, u.email || ':payment')     AS payment_uuid,
                            uuid_generate_v5('00000000-0000-0000-0000-000000000000'::uuid, u.email || ':transaction') AS transaction_uuid,
                            CASE abs(hashtext(u.email)) % 4
                                WHEN 0 THEN 19.99::numeric(12, 2)
                                WHEN 1 THEN 39.99::numeric(12, 2)
                                WHEN 2 THEN 79.99::numeric(12, 2)
                                ELSE 129.99::numeric(12, 2)
                                END                                                                                   AS rnd_amount,
                            NOW() - (INTERVAL '1 second' * (abs(hashtext(u.email)) % (60 * 60 * 24 * 90)))            AS rnd_date
                     FROM auth."user" u
                     WHERE u.email IN (SELECT email FROM _config.user_email_reference WHERE role = 'USER')),
     inserted_payments AS (
         INSERT INTO payment.payment (uuid, user_id, transaction_id, amount, currency,
                                      gateway, gateway_id, status, type, created_date, updated_date)
             SELECT source.payment_uuid,
                    source.user_uuid,
                    source.transaction_uuid,
                    source.rnd_amount,
                    'usd',
                    'STRIPE',
                    'in_' || encode(gen_random_bytes(8), 'hex'),
                    'CONFIRMED',
                    'RECURRING',
                    source.rnd_date,
                    source.rnd_date
             FROM seed_source source
             ON CONFLICT (uuid) DO NOTHING
             RETURNING id, user_id, amount, created_date)
INSERT
INTO payment.payment_history (payment_id, update_type, update_data, applied, created_date, updated_date)
SELECT inserted.id,
       'NEW',
       json_build_object(
               'type', 'RECURRING',
               'amount', inserted.amount,
               'status', 'CONFIRMED',
               'gateway', 'STRIPE',
               'user_id', inserted.user_id,
               'currency', 'usd'
       ),
       true,
       inserted.created_date,
       inserted.created_date
FROM inserted_payments inserted;
