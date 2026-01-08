CREATE DATABASE physio_db;

\c physio_db;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
