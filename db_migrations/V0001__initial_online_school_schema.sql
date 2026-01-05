CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    password_hash VARCHAR(255),
    grade INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    video_url TEXT,
    document_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_variants (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id),
    name VARCHAR(100) NOT NULL,
    variant_number INTEGER NOT NULL,
    time_limit_minutes INTEGER DEFAULT 45,
    max_score INTEGER DEFAULT 100,
    is_published BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    test_variant_id INTEGER REFERENCES test_variants(id),
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    student_login VARCHAR(100) NOT NULL,
    test_variant_id INTEGER REFERENCES test_variants(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INTEGER,
    is_locked BOOLEAN DEFAULT FALSE,
    can_retake BOOLEAN DEFAULT FALSE,
    checked_by VARCHAR(100),
    checked_at TIMESTAMP,
    time_used_seconds INTEGER,
    auto_checked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id),
    question_id INTEGER REFERENCES questions(id),
    student_answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_time_limits (
    id SERIAL PRIMARY KEY,
    student_login VARCHAR(100) UNIQUE NOT NULL,
    daily_limit_minutes INTEGER DEFAULT 80,
    used_today_minutes INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    has_subscription BOOLEAN DEFAULT FALSE,
    subscription_expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('teacher', 'school')),
    sender_login VARCHAR(100) NOT NULL,
    sender_name VARCHAR(200) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    description TEXT,
    url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS live_streams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    stream_url TEXT NOT NULL,
    scheduled_at TIMESTAMP,
    is_live BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_quarter ON subjects(grade, quarter);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_login);
CREATE INDEX IF NOT EXISTS idx_submissions_test ON submissions(test_variant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

INSERT INTO users (login, display_name, role, created_by) 
VALUES ('никитовский', 'Никитовский (Директор)', 'admin', 'system')
ON CONFLICT (login) DO NOTHING;
