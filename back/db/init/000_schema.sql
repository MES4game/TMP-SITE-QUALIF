CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_connection DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_on DATETIME NULL,
    verified_email BOOLEAN DEFAULT FALSE,
    avatar_path VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    color VARCHAR(20) DEFAULT '#000000',
    short_title VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description_fr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    time_limit INT DEFAULT 1000,
    memory_limit INT DEFAULT 256
);

CREATE TABLE IF NOT EXISTS samples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    explanation_fr TEXT NULL,
    explanation_en TEXT NULL,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS languages (
    `key` VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    color VARCHAR(20) DEFAULT '#000000'
);

CREATE TABLE IF NOT EXISTS submits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    status_id INT NOT NULL,
    submited_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (language) REFERENCES languages(`key`) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skeletons (
    problem_id INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    PRIMARY KEY (problem_id, language),
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (language) REFERENCES languages(`key`) ON DELETE CASCADE
);
