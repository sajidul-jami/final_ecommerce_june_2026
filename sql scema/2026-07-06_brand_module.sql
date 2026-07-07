USE ecommerce;

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

CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(150) UNIQUE,
    logo VARCHAR(500),
    description TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    seo_title VARCHAR(180),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CALL add_column_if_missing('brands', 'slug', 'VARCHAR(150) NULL');
CALL add_column_if_missing('brands', 'logo', 'VARCHAR(500) NULL');
CALL add_column_if_missing('brands', 'description', 'TEXT NULL');
CALL add_column_if_missing('brands', 'status', 'ENUM(''Active'', ''Inactive'') DEFAULT ''Active''');
CALL add_column_if_missing('brands', 'seo_title', 'VARCHAR(180) NULL');
CALL add_column_if_missing('brands', 'seo_description', 'VARCHAR(500) NULL');
CALL add_column_if_missing('brands', 'seo_keywords', 'VARCHAR(500) NULL');
CALL add_column_if_missing('products', 'brand_id', 'INT NULL');

UPDATE brands
SET slug = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-')))
WHERE (slug IS NULL OR slug = '') AND name IS NOT NULL;

UPDATE brands
SET slug = CONCAT('brand-', id)
WHERE slug IS NULL OR slug = '';

CALL add_index_if_missing('brands', 'idx_brands_status_name', '(status, name)');
CALL add_index_if_missing('brands', 'idx_brands_slug', '(slug)');
CALL add_index_if_missing('products', 'idx_products_brand', '(brand_id)');

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
