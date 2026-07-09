USE ecommerce;

CREATE TABLE IF NOT EXISTS customer_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150) NULL,
    subject VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    page_url VARCHAR(500) NULL,
    status ENUM('Open', 'Replied', 'Closed') DEFAULT 'Open',
    admin_reply TEXT NULL,
    replied_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_messages_phone (phone),
    INDEX idx_customer_messages_status (status),
    INDEX idx_customer_messages_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS visitor_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(120) NOT NULL UNIQUE,
    source VARCHAR(80) DEFAULT 'direct',
    referrer TEXT NULL,
    ip_address VARCHAR(80) NULL,
    user_agent TEXT NULL,
    first_page VARCHAR(500) NULL,
    last_page VARCHAR(500) NULL,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    page_views INT DEFAULT 0,
    INDEX idx_visitor_sessions_source (source),
    INDEX idx_visitor_sessions_last_seen (last_seen)
);

CREATE TABLE IF NOT EXISTS visitor_page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(120) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255) NULL,
    referrer TEXT NULL,
    source VARCHAR(80) DEFAULT 'direct',
    ip_address VARCHAR(80) NULL,
    user_agent TEXT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_visitor_page_session (session_id),
    INDEX idx_visitor_page_source (source),
    INDEX idx_visitor_page_viewed_at (viewed_at)
);
