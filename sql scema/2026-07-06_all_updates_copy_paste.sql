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

CREATE TABLE IF NOT EXISTS site_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    website_name VARCHAR(150),
    website_logo VARCHAR(500),
    footer_logo VARCHAR(500),
    favicon VARCHAR(500),
    website_description TEXT,
    footer_title VARCHAR(150),
    footer_description TEXT,
    footer_quick_links TEXT,
    contact_email VARCHAR(150),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    office_address TEXT,
    google_map TEXT,
    support_email VARCHAR(150),
    footer_copyright VARCHAR(255),
    meta_title VARCHAR(180),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    google_analytics TEXT,
    google_tag_manager TEXT,
    facebook_pixel TEXT,
    inside_dhaka_delivery_charge DECIMAL(10,2) DEFAULT 80,
    outside_dhaka_delivery_charge DECIMAL(10,2) DEFAULT 120,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
);

CALL add_column_if_missing('brands', 'slug', 'VARCHAR(150) NULL');
CALL add_column_if_missing('brands', 'logo', 'VARCHAR(500) NULL');
CALL add_column_if_missing('brands', 'description', 'TEXT NULL');
CALL add_column_if_missing('brands', 'status', 'ENUM(''Active'', ''Inactive'') DEFAULT ''Active''');
CALL add_column_if_missing('brands', 'seo_title', 'VARCHAR(180) NULL');
CALL add_column_if_missing('brands', 'seo_description', 'VARCHAR(500) NULL');
CALL add_column_if_missing('brands', 'seo_keywords', 'VARCHAR(500) NULL');

CALL add_column_if_missing('products', 'brand_id', 'INT NULL');
CALL add_column_if_missing('products', 'country_of_origin', 'VARCHAR(100) NULL');

CALL add_column_if_missing('orders', 'delivery_address_id', 'INT NULL');
CALL add_column_if_missing('orders', 'delivery_name', 'VARCHAR(150) NULL');
CALL add_column_if_missing('orders', 'delivery_phone', 'VARCHAR(30) NULL');
CALL add_column_if_missing('orders', 'delivery_email', 'VARCHAR(150) NULL');
CALL add_column_if_missing('orders', 'delivery_address', 'TEXT NULL');
CALL add_column_if_missing('orders', 'delivery_city', 'VARCHAR(100) NULL');
CALL add_column_if_missing('orders', 'delivery_area', 'VARCHAR(100) NULL');
CALL add_column_if_missing('orders', 'delivery_zone', 'ENUM(''Inside Dhaka'', ''Outside Dhaka'') NULL');
CALL add_column_if_missing('orders', 'delivery_charge', 'DECIMAL(10,2) DEFAULT 0');
CALL add_column_if_missing('orders', 'order_notes', 'TEXT NULL');
CALL add_column_if_missing('orders', 'checkout_type', 'ENUM(''guest'', ''user'') DEFAULT ''user''');

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

UPDATE brands
SET slug = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-')))
WHERE (slug IS NULL OR slug = '') AND name IS NOT NULL;

UPDATE brands
SET slug = CONCAT('brand-', id)
WHERE slug IS NULL OR slug = '';

INSERT INTO site_settings (
    id,
    website_name,
    website_description,
    footer_title,
    footer_description,
    footer_quick_links,
    contact_email,
    phone,
    office_address,
    support_email,
    footer_copyright,
    meta_title,
    meta_description,
    meta_keywords,
    inside_dhaka_delivery_charge,
    outside_dhaka_delivery_charge
) VALUES (
    1,
    'TechTrends BD',
    'Quality tech products in Bangladesh with fast checkout and cash on delivery.',
    'TechTrends BD',
    'Trusted tech products in Bangladesh with fast ordering, clear stock and easy payment options.',
    'Shop | /\nHelp & Support | /help_support\nCart | /cart',
    'support@techtrendsbd.com',
    '+880 1700-000000',
    'Dhaka, Bangladesh',
    'support@techtrendsbd.com',
    'Copyright 2026 TechTrendsBD.com. All rights reserved.',
    'TechTrends BD - Quality Tech Products in Bangladesh',
    'Quality tech products in Bangladesh with fast checkout and cash on delivery.',
    'tech products Bangladesh, laptops, mobile phones, tablets, gaming PC, TechTrends BD',
    80,
    120
)
ON DUPLICATE KEY UPDATE
    website_name = COALESCE(NULLIF(website_name, ''), VALUES(website_name)),
    website_description = COALESCE(NULLIF(website_description, ''), VALUES(website_description)),
    footer_title = COALESCE(NULLIF(footer_title, ''), VALUES(footer_title)),
    footer_description = COALESCE(NULLIF(footer_description, ''), VALUES(footer_description)),
    footer_quick_links = COALESCE(NULLIF(footer_quick_links, ''), VALUES(footer_quick_links)),
    contact_email = COALESCE(NULLIF(contact_email, ''), VALUES(contact_email)),
    phone = COALESCE(NULLIF(phone, ''), VALUES(phone)),
    office_address = COALESCE(NULLIF(office_address, ''), VALUES(office_address)),
    support_email = COALESCE(NULLIF(support_email, ''), VALUES(support_email)),
    footer_copyright = COALESCE(NULLIF(footer_copyright, ''), VALUES(footer_copyright)),
    meta_title = COALESCE(NULLIF(meta_title, ''), VALUES(meta_title)),
    meta_description = COALESCE(NULLIF(meta_description, ''), VALUES(meta_description)),
    meta_keywords = COALESCE(NULLIF(meta_keywords, ''), VALUES(meta_keywords)),
    inside_dhaka_delivery_charge = COALESCE(inside_dhaka_delivery_charge, VALUES(inside_dhaka_delivery_charge)),
    outside_dhaka_delivery_charge = COALESCE(outside_dhaka_delivery_charge, VALUES(outside_dhaka_delivery_charge));

CALL add_index_if_missing('brands', 'idx_brands_status_name', '(status, name)');
CALL add_index_if_missing('brands', 'idx_brands_slug', '(slug)');
CALL add_index_if_missing('products', 'idx_products_brand', '(brand_id)');
CALL add_index_if_missing('products', 'idx_products_country_of_origin', '(country_of_origin)');

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
