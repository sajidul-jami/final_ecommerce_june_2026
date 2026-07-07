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

CREATE TABLE IF NOT EXISTS product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    tag_name VARCHAR(80) NOT NULL,
    slug VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_product_tags_product (product_id),
    KEY idx_product_tags_name (tag_name)
);

CREATE TABLE IF NOT EXISTS cms_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    content LONGTEXT,
    meta_title VARCHAR(180),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CALL add_column_if_missing('products', 'slug', 'VARCHAR(200) NULL');
CALL add_column_if_missing('product_tags', 'slug', 'VARCHAR(120) NULL');
CALL add_column_if_missing('cms_pages', 'meta_title', 'VARCHAR(180) NULL');
CALL add_column_if_missing('cms_pages', 'meta_description', 'VARCHAR(500) NULL');
CALL add_column_if_missing('cms_pages', 'meta_keywords', 'VARCHAR(500) NULL');
CALL add_column_if_missing('cms_pages', 'status', 'ENUM(''Active'', ''Inactive'') DEFAULT ''Active''');

DROP TEMPORARY TABLE IF EXISTS product_slug_updates;
CREATE TEMPORARY TABLE product_slug_updates AS
SELECT
    id,
    CASE
      WHEN rn = 1 THEN base_slug
      ELSE CONCAT(base_slug, '-', id)
    END AS new_slug
FROM (
    SELECT
        id,
        base_slug,
        ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS rn
    FROM (
        SELECT
            id,
            COALESCE(
              NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(COALESCE(NULLIF(slug, ''), name, CONCAT('product-', id)), '[^a-zA-Z0-9]+', '-'))), ''),
              CONCAT('product-', id)
            ) AS base_slug
        FROM products
    ) base
) ranked;

UPDATE products p
JOIN product_slug_updates u ON u.id = p.id
SET p.slug = u.new_slug;

UPDATE category
SET cat_slug = COALESCE(
  NULLIF(cat_slug, ''),
  NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-'))), ''),
  cat_code
)
WHERE cat_slug IS NULL OR cat_slug = '';

UPDATE product_tags
SET slug = COALESCE(
  NULLIF(slug, ''),
  NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(tag_name, '[^a-zA-Z0-9]+', '-'))), ''),
  CONCAT('tag-', id)
)
WHERE slug IS NULL OR slug = '';

CALL add_index_if_missing('products', 'idx_products_slug', '(slug)');
CALL add_index_if_missing('category', 'idx_category_slug', '(cat_slug)');
CALL add_index_if_missing('product_tags', 'idx_product_tags_slug', '(slug)');
CALL add_index_if_missing('cms_pages', 'idx_cms_pages_slug_status', '(slug, status)');

DROP TEMPORARY TABLE IF EXISTS product_slug_updates;
DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
