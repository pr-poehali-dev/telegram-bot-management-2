
CREATE TABLE bot_users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_blocked BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bot_messages (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    direction VARCHAR(10) NOT NULL DEFAULT 'in',
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bot_commands_log (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    command VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bot_broadcasts (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bot_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO bot_settings (key, value) VALUES
('bot_name', 'My Telegram Bot'),
('welcome_message', 'Добро пожаловать!'),
('auto_approve', 'false'),
('moderation_enabled', 'true');

CREATE INDEX idx_bot_users_telegram_id ON bot_users(telegram_id);
CREATE INDEX idx_bot_messages_created_at ON bot_messages(created_at);
CREATE INDEX idx_bot_commands_log_created_at ON bot_commands_log(created_at);
