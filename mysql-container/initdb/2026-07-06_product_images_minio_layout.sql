USE ecommerce;

-- Product image storage convention from 2026-07-06:
-- MinIO bucket: ecommerce
-- Product object keys: products/<product-slug>/<file-name>
-- Slideshow object keys: slideshow/<file-name>
-- Website logo object keys: logo/website/<file-name>
-- Brand logo object keys: logo/brands/<file-name>

CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(150),
    logo VARCHAR(500),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(180),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
    IN table_name_value VARCHAR(64),
    IN column_name_value VARCHAR(64),
    IN column_definition_value TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = table_name_value
          AND COLUMN_NAME = column_name_value
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', table_name_value, '` ADD COLUMN `', column_name_value, '` ', column_definition_value);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE PROCEDURE add_index_if_missing(
    IN table_name_value VARCHAR(64),
    IN index_name_value VARCHAR(64),
    IN index_definition_value TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = table_name_value
          AND INDEX_NAME = index_name_value
    ) THEN
        SET @ddl = CONCAT('CREATE INDEX `', index_name_value, '` ON `', table_name_value, '` ', index_definition_value);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('products', 'brand_id', 'INT NULL AFTER category_id');
CALL add_index_if_missing('product_images', 'idx_product_images_product', '(product_id, sort_order)');
CALL add_index_if_missing('brands', 'idx_brands_status_name', '(status, name)');

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

ALTER TABLE products MODIFY photo VARCHAR(500);
ALTER TABLE product_images MODIFY image_url VARCHAR(500) NOT NULL;
ALTER TABLE orders MODIFY customer_id INT NULL;

INSERT INTO admins (full_name, email, password, role, phone, status)
VALUES (
    'Initial Admin',
    'admin@ecommerce.local',
    '$2b$10$hyZ3SzMV6aj/2esfPrShaONAQ3/8ScueWj1WafbakyEhzWE3klWMG',
    'Super Admin',
    '',
    'Active'
)
ON DUPLICATE KEY UPDATE email = email;
