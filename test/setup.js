// Loaded before any app code (see "test" script). Tests never touch a real DB.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-1234";
process.env.BCRYPT_ROUNDS = "10";
process.env.DB_HOST ??= "127.0.0.1";
process.env.DB_USER ??= "test";
process.env.DB_NAME ??= "test";
