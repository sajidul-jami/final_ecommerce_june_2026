USE ecommerce;

DROP PROCEDURE IF EXISTS add_column_if_missing;

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

DELIMITER ;

CALL add_column_if_missing('site_settings', 'footer_title', 'VARCHAR(150) NULL');
CALL add_column_if_missing('site_settings', 'footer_description', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'footer_quick_links', 'TEXT NULL');

UPDATE site_settings
SET footer_title = COALESCE(NULLIF(footer_title, ''), website_name),
    footer_description = COALESCE(NULLIF(footer_description, ''), website_description),
    footer_quick_links = COALESCE(NULLIF(footer_quick_links, ''), 'Shop | /\nHelp & Support | /help_support\nCart | /cart')
WHERE id = 1;

DROP PROCEDURE IF EXISTS add_column_if_missing;
