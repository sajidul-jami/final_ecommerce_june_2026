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

CALL add_column_if_missing('orders', 'delivery_zone', 'ENUM(''Inside Dhaka'', ''Outside Dhaka'') NULL');
CALL add_column_if_missing('orders', 'delivery_charge', 'DECIMAL(10,2) DEFAULT 0');
CALL add_column_if_missing('site_settings', 'inside_dhaka_delivery_charge', 'DECIMAL(10,2) DEFAULT 80');
CALL add_column_if_missing('site_settings', 'outside_dhaka_delivery_charge', 'DECIMAL(10,2) DEFAULT 120');

UPDATE site_settings
SET inside_dhaka_delivery_charge = COALESCE(inside_dhaka_delivery_charge, 80),
    outside_dhaka_delivery_charge = COALESCE(outside_dhaka_delivery_charge, 120)
WHERE id = 1;

DROP PROCEDURE IF EXISTS add_column_if_missing;
