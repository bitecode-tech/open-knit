CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH seed_source AS (SELECT u.uuid                                                                                    AS user_uuid,
                            u.email,
                            row_number() OVER (ORDER BY u.email)                                                      AS row_no,
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
     inserted_transactions AS (
         INSERT INTO transaction.transaction (uuid, user_id, payment_id, type, status, sub_status,
                                              debit_total, debit_type, debit_currency,
                                              credit_total, credit_type, credit_currency,
                                              created_date, updated_date)
             SELECT source.transaction_uuid,
                    source.user_uuid,
                    source.payment_uuid,
                    'SUBSCRIPTION_PAYMENT',
                    CASE
                        WHEN source.row_no <= 2 THEN 'PENDING'
                        WHEN source.row_no <= 4 THEN 'CANCELLED'
                        WHEN source.row_no <= 6 THEN 'ERROR'
                        ELSE 'COMPLETED'
                        END,
                    CASE
                        WHEN source.row_no <= 2 THEN 'AWAITS_PAYMENT_GATEWAY_UPDATE'
                        WHEN source.row_no <= 4 THEN 'PAYMENT_REJECTED'
                        WHEN source.row_no <= 6 THEN 'PAYMENT_ERROR'
                        ELSE 'DONE'
                        END,
                    source.rnd_amount,
                    'CARD',
                    'usd',
                    source.rnd_amount,
                    'PROVIDER_WALLET',
                    'usd',
                    source.rnd_date,
                    source.rnd_date
             FROM seed_source source
             ON CONFLICT (uuid) DO NOTHING
             RETURNING id, uuid, user_id, payment_id, status, sub_status, debit_total, created_date)
INSERT
INTO transaction.transaction_event (transaction_id, event_name, event_data, created_date, updated_date)
SELECT inserted.id,
       'CreatePaymentTransactionEvent',
       jsonb_build_object(
               '@class', 'bitecode.modules.transaction.model.command.payment.CreatePaymentTransactionCommand',
               'amount', inserted.debit_total,
               'userId', inserted.user_id,
               'currency', 'usd',
               'paymentId', inserted.payment_id,
               'paymentType', 'RECURRING',
               'paymentStatus', 'CONFIRMED',
               'paymentGateway', 'STRIPE'
       ),
       inserted.created_date,
       inserted.created_date
FROM inserted_transactions inserted;

INSERT INTO transaction.transaction_event (transaction_id, event_name, event_data, created_date, updated_date)
SELECT txn.id,
       'UpdateTransactionStatusCommand',
       jsonb_build_object(
               '@class', 'bitecode.modules.transaction.model.command.UpdateTransactionStatusCommand',
               'uuid', txn.uuid,
               'status', txn.status,
               'subStatus', txn.sub_status
       ),
       txn.created_date + INTERVAL '1 second',
       txn.created_date + INTERVAL '1 second'
FROM transaction.transaction txn
         JOIN auth."user" u ON u.uuid = txn.user_id
         JOIN _config.user_email_reference ref ON ref.email = u.email AND ref.role = 'USER'
         LEFT JOIN transaction.transaction_event existing_evt
                   ON existing_evt.transaction_id = txn.id
                       AND existing_evt.event_name = 'UpdateTransactionStatusCommand'
WHERE txn.status IN ('CANCELLED', 'ERROR')
  AND existing_evt.id IS NULL;
