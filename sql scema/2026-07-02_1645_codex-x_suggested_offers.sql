-- 2026-07-02 16:45 Codex-X suggested offers upgrade
-- Adds campaign grouping and display controls for storefront offer sections.

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing$$
DROP PROCEDURE IF EXISTS add_index_if_missing$$

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

CALL add_column_if_missing('offers', 'offer_type', "VARCHAR(80) NOT NULL DEFAULT 'Special Offers' AFTER title");
CALL add_column_if_missing('offers', 'badge_text', "VARCHAR(40) NULL AFTER offer_type");
CALL add_column_if_missing('offers', 'sort_order', "INT NOT NULL DEFAULT 0 AFTER status");

CALL add_index_if_missing('offers', 'idx_offers_active_dates', '(status, start_date, end_date)');
CALL add_index_if_missing('offers', 'idx_offers_type_sort', '(offer_type, sort_order)');

UPDATE offers
SET offer_type = COALESCE(NULLIF(offer_type, ''), NULLIF(title, ''), 'Special Offers')
WHERE offer_type IS NULL OR offer_type = '';

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
