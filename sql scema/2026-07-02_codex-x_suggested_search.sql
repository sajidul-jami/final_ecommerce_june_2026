-- 2026-07-02 Codex-X suggested search support
-- Run this on the ecommerce database for better product search and suggestions.

CREATE TABLE IF NOT EXISTS product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_product_tag (product_id, tag_name),
    KEY idx_product_tags_name (tag_name),
    CONSTRAINT fk_product_tags_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);

DELIMITER $$

DROP PROCEDURE IF EXISTS add_index_if_missing$$

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

CALL add_index_if_missing('products', 'idx_products_name', '(name)');
CALL add_index_if_missing('products', 'idx_products_sku', '(sku)');
CALL add_index_if_missing('category', 'idx_category_name_slug_code', '(name, cat_slug, cat_code)');
CALL add_index_if_missing('product_tags', 'idx_product_tags_name', '(tag_name)');

DROP PROCEDURE IF EXISTS add_index_if_missing;
