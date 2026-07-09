USE ecommerce;

CREATE TABLE IF NOT EXISTS site_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CALL add_column_if_missing('site_settings', 'website_name', 'VARCHAR(150) NULL');
CALL add_column_if_missing('site_settings', 'website_logo', 'VARCHAR(500) NULL');
CALL add_column_if_missing('site_settings', 'footer_logo', 'VARCHAR(500) NULL');
CALL add_column_if_missing('site_settings', 'favicon', 'VARCHAR(500) NULL');
CALL add_column_if_missing('site_settings', 'website_description', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'footer_title', 'VARCHAR(150) NULL');
CALL add_column_if_missing('site_settings', 'footer_description', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'footer_quick_links', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'contact_email', 'VARCHAR(150) NULL');
CALL add_column_if_missing('site_settings', 'phone', 'VARCHAR(50) NULL');
CALL add_column_if_missing('site_settings', 'whatsapp', 'VARCHAR(50) NULL');
CALL add_column_if_missing('site_settings', 'office_address', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'google_map', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'support_email', 'VARCHAR(150) NULL');
CALL add_column_if_missing('site_settings', 'footer_copyright', 'VARCHAR(255) NULL');
CALL add_column_if_missing('site_settings', 'meta_title', 'VARCHAR(180) NULL');
CALL add_column_if_missing('site_settings', 'meta_description', 'VARCHAR(500) NULL');
CALL add_column_if_missing('site_settings', 'meta_keywords', 'VARCHAR(500) NULL');
CALL add_column_if_missing('site_settings', 'google_analytics', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'google_tag_manager', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'facebook_pixel', 'TEXT NULL');
CALL add_column_if_missing('site_settings', 'inside_dhaka_delivery_charge', 'DECIMAL(10,2) DEFAULT 80');
CALL add_column_if_missing('site_settings', 'outside_dhaka_delivery_charge', 'DECIMAL(10,2) DEFAULT 120');
CALL add_column_if_missing('site_settings', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

INSERT INTO site_settings (
    id,
    website_name,
    inside_dhaka_delivery_charge,
    outside_dhaka_delivery_charge
) VALUES (
    1,
    'TechTrends BD',
    80,
    120
)
ON DUPLICATE KEY UPDATE
    inside_dhaka_delivery_charge = COALESCE(inside_dhaka_delivery_charge, VALUES(inside_dhaka_delivery_charge)),
    outside_dhaka_delivery_charge = COALESCE(outside_dhaka_delivery_charge, VALUES(outside_dhaka_delivery_charge));

DROP PROCEDURE IF EXISTS add_column_if_missing;
