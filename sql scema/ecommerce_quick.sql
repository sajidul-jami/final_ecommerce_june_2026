-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2026 at 08:29 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Super Admin','Manager','Support') DEFAULT 'Manager',
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `full_name`, `email`, `password`, `role`, `phone`, `status`, `created_at`) VALUES
(1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', '$2b$10$CN5jkii.gTRYXeHT23811.k5edbOfOGqXRnHWnhhGiKwqYOfCheYS', 'Super Admin', '01919926637', 'Active', '2026-06-02 10:53:08'),
(2, 'Riyad', 'riyad@gmail.com', '$2b$10$CN5jkii.gTRYXeHT23811.k5edbOfOGqXRnHWnhhGiKwqYOfCheYS', 'Super Admin', '0010102220', 'Active', '2026-06-02 11:05:57'),
(3, 'Md. Rakib', 'rakib@gmail.com', '$2b$10$nRSDUIxa7Jmc7wQxdO17ZeV819a7P96uELCkHTfyw5WiXYSDHl0UK', 'Manager', '001111', 'Active', '2026-06-03 04:01:29'),
(4, 'Minnat', 'minnat@gmail.com', '$2b$10$Qkt.dGcaak.WmzybIELhs.9yJojXAPOGrKEgwGJGBgM1.pYqekPlW', 'Manager', '01236547', 'Active', '2026-06-10 05:09:42');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `cat_slug` varchar(150) NOT NULL,
  `cat_code` varchar(50) NOT NULL,
  `parent_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `cat_slug`, `cat_code`, `parent_code`, `created_at`) VALUES
(1, 'IT Products', 'IT Products', '000', NULL, '2026-06-02 09:35:29'),
(2, 'Computer', 'computer-labtop', '000-001', '000', '2026-06-03 07:08:42'),
(9, 'Human', 'human', '001', NULL, '2026-06-06 05:44:38'),
(10, 'Smart Phone', 'mobile-smart_phone', '000-002', '000', '2026-06-06 05:59:47'),
(11, 'Tablet', 'tablet', '000-003', '000', '2026-06-06 06:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `details`
--

CREATE TABLE `details` (
  `id` int(11) NOT NULL,
  `sales_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `details`
--

INSERT INTO `details` (`id`, `sales_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 899.00),
(2, 1, 2, 1, 799.00),
(3, 2, 11, 1, 489.98),
(4, 3, 13, 1, 799.99),
(5, 4, 10, 1, 599.99),
(6, 4, 2, 2, 799.00),
(7, 5, 23, 1, 889.99),
(8, 5, 19, 1, 99.99),
(10, 7, 20, 1, 339.00),
(11, 8, 11, 3, 489.98),
(12, 9, 22, 1, 829.00),
(13, 10, 21, 1, 1599.00),
(14, 11, 5, 1, 339.00),
(15, 12, 20, 1, 339.00),
(16, 12, 17, 1, 49.99),
(17, 12, 7, 1, 619.00),
(18, 13, 8, 1, 549.99),
(19, 14, 18, 1, 79.99),
(20, 15, 14, 1, 899.99),
(21, 16, 16, 11, 649.99),
(22, 16, 21, 21, 1599.00),
(23, 16, 7, 1, 619.00),
(24, 17, 1, 1, 899.00),
(25, 18, 20, 1, 339.00),
(26, 19, 18, 1, 79.99),
(27, 20, 12, 1, 749.99),
(28, 21, 19, 1, 99.99),
(29, 21, 17, 1, 49.99),
(30, 21, 13, 1, 799.99),
(31, 21, 14, 1, 899.99),
(32, 22, 20, 1, 339.00),
(34, 24, 22, 5, 829.00),
(35, 25, 21, 1, 1599.00),
(36, 26, 22, 6, 829.00),
(37, 26, 20, 8, 339.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('Cash On Delivery','Card','Bkash','Nagad') DEFAULT NULL,
  `order_status` enum('Pending','Processing','Completed','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `payment_method`, `order_status`, `created_at`) VALUES
(1, 1, 1698.00, 'Cash On Delivery', 'Completed', '2026-06-02 09:51:17'),
(2, 1, 489.98, 'Cash On Delivery', 'Completed', '2026-06-02 10:28:47'),
(3, 1, 799.99, 'Cash On Delivery', 'Completed', '2026-06-02 10:49:32'),
(4, 1, 2197.99, 'Cash On Delivery', 'Completed', '2026-06-02 10:51:08'),
(5, 2, 989.98, 'Cash On Delivery', 'Completed', '2026-06-03 03:23:11'),
(6, 2, 1.00, 'Cash On Delivery', 'Pending', '2026-06-03 04:53:28'),
(7, 2, 339.00, 'Cash On Delivery', 'Pending', '2026-06-03 05:08:53'),
(8, 2, 1469.94, 'Cash On Delivery', 'Pending', '2026-06-03 05:10:12'),
(9, 2, 829.00, 'Cash On Delivery', 'Pending', '2026-06-03 05:48:49'),
(10, 2, 1599.00, 'Cash On Delivery', 'Pending', '2026-06-03 05:49:26'),
(11, 3, 339.00, 'Cash On Delivery', 'Pending', '2026-06-03 07:12:20'),
(12, 3, 1007.99, 'Cash On Delivery', 'Pending', '2026-06-03 07:12:57'),
(13, 1, 549.99, 'Cash On Delivery', 'Pending', '2026-06-03 08:21:33'),
(14, 1, 79.99, 'Cash On Delivery', 'Pending', '2026-06-03 09:22:58'),
(15, 2, 899.99, 'Cash On Delivery', 'Pending', '2026-06-03 09:27:25'),
(16, 2, 41347.89, 'Cash On Delivery', 'Pending', '2026-06-03 09:29:31'),
(17, 1, 899.00, 'Cash On Delivery', 'Pending', '2026-06-03 11:09:37'),
(18, 1, 339.00, 'Cash On Delivery', 'Pending', '2026-06-03 11:10:22'),
(19, 1, 79.99, 'Cash On Delivery', 'Pending', '2026-06-03 11:21:30'),
(20, 4, 749.99, 'Cash On Delivery', 'Pending', '2026-06-04 10:25:38'),
(21, 4, 1849.96, 'Cash On Delivery', 'Pending', '2026-06-04 10:42:36'),
(22, 1, 339.00, 'Cash On Delivery', 'Pending', '2026-06-06 05:23:54'),
(23, 1, 1000.00, 'Cash On Delivery', 'Pending', '2026-06-06 05:48:55'),
(24, 1, 4145.00, 'Cash On Delivery', 'Pending', '2026-06-06 06:34:37'),
(25, 5, 1599.00, 'Cash On Delivery', 'Pending', '2026-06-06 06:48:20'),
(26, 1, 7686.00, 'Cash On Delivery', 'Pending', '2026-06-07 10:31:08');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('Paid','Unpaid','Refunded') DEFAULT 'Paid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `transaction_id`, `amount`, `payment_status`, `created_at`) VALUES
(1, 1, 'COD-1', 1698.00, 'Unpaid', '2026-06-02 09:51:17'),
(2, 2, 'COD-2', 489.98, 'Unpaid', '2026-06-02 10:28:47'),
(3, 3, 'COD-3', 799.99, 'Unpaid', '2026-06-02 10:49:32'),
(4, 4, 'COD-4', 2197.99, 'Unpaid', '2026-06-02 10:51:08'),
(5, 5, 'COD-5', 989.98, 'Unpaid', '2026-06-03 03:23:11'),
(6, 6, 'COD-6', 1.00, 'Unpaid', '2026-06-03 04:53:28'),
(7, 7, 'COD-7', 339.00, 'Unpaid', '2026-06-03 05:08:53'),
(8, 8, 'COD-8', 1469.94, 'Unpaid', '2026-06-03 05:10:12'),
(9, 9, 'COD-9', 829.00, 'Unpaid', '2026-06-03 05:48:49'),
(10, 10, 'COD-10', 1599.00, 'Unpaid', '2026-06-03 05:49:26'),
(11, 11, 'COD-11', 339.00, 'Unpaid', '2026-06-03 07:12:20'),
(12, 12, 'COD-12', 1007.99, 'Unpaid', '2026-06-03 07:12:57'),
(13, 13, 'COD-13', 549.99, 'Unpaid', '2026-06-03 08:21:33'),
(14, 14, 'COD-14', 79.99, 'Unpaid', '2026-06-03 09:22:58'),
(15, 15, 'COD-15', 899.99, 'Unpaid', '2026-06-03 09:27:25'),
(16, 16, 'COD-16', 41347.89, 'Unpaid', '2026-06-03 09:29:31'),
(17, 17, 'COD-17', 899.00, 'Unpaid', '2026-06-03 11:09:37'),
(18, 18, 'COD-18', 339.00, 'Unpaid', '2026-06-03 11:10:22'),
(19, 19, 'COD-19', 79.99, 'Unpaid', '2026-06-03 11:21:30'),
(20, 20, 'COD-20', 749.99, 'Unpaid', '2026-06-04 10:25:38'),
(21, 21, 'COD-21', 1849.96, 'Unpaid', '2026-06-04 10:42:36'),
(22, 22, 'COD-22', 339.00, 'Unpaid', '2026-06-06 05:23:54'),
(23, 23, 'COD-23', 1000.00, 'Unpaid', '2026-06-06 05:48:55'),
(24, 24, 'COD-24', 4145.00, 'Unpaid', '2026-06-06 06:34:37'),
(25, 25, 'COD-25', 1599.00, 'Unpaid', '2026-06-06 06:48:20'),
(26, 26, 'COD-26', 7686.00, 'Unpaid', '2026-06-07 10:31:08');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `price` double NOT NULL,
  `photo` varchar(200) DEFAULT NULL,
  `date_view` date DEFAULT NULL,
  `counter` int(11) DEFAULT 0,
  `quantity` int(11) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `slug`, `price`, `photo`, `date_view`, `counter`, `quantity`, `sku`, `status`, `created_at`) VALUES
(1, 2, 'DELL Inspiron 15 7000 15.6', 'Dell gaming laptop', 'dell-inspiron-15-7000-15-6', 8990, 'dell-inspiron-15-7000-15-6.jpg', '2018-07-09', 5, 4300, 'PRD00001', 'Active', '2026-06-02 09:38:39'),
(2, 2, 'MICROSOFT Surface Pro 4 & Typecover - 128 GB', 'Microsoft Surface tablet', 'microsoft-surface-pro-4-typecover-128-gb', 799, 'microsoft-surface-pro-4-typecover-128-gb.jpg', '2018-05-10', 5, 8, 'PRD00002', 'Active', '2026-06-02 09:38:39'),
(3, 2, 'DELL Inspiron 15 5000 15.6', 'Dell laptop', 'dell-inspiron-15-5000-15-6', 599, 'dell-inspiron-15-5000-15-6.jpg', '2018-05-12', 3, 11, 'PRD00003', 'Active', '2026-06-02 09:38:39'),
(4, 2, 'LENOVO Ideapad 320s-14IKB', 'Lenovo laptop', 'lenovo-ideapad-320s-14ikb-14-laptop-grey', 399, 'lenovo-ideapad-320s-14ikb-14-laptop-grey.jpg', '2018-05-10', 4, 11, 'PRD00004', 'Active', '2026-06-02 09:38:39'),
(5, 11, 'APPLE 9.7 iPad 32GB Gold', 'Apple tablet', 'apple-9-7-ipad-32-gb-gold', 339, 'apple-9-7-ipad-32-gb-gold.jpg', '2018-07-09', 10, 10, 'PRD00005', 'Active', '2026-06-02 09:38:39'),
(6, 2, 'DELL Inspiron 15 5000 15', 'Dell laptop', 'dell-inspiron-15-5000-15', 449.99, 'dell-inspiron-15-5000-15.jpg', NULL, 0, 11, 'PRD00006', 'Active', '2026-06-02 09:38:39'),
(7, 10, 'APPLE 10.5 iPad Pro 64GB', 'Apple tablet', 'apple-10-5-ipad-pro-64-gb-space-grey-2017', 619, 'apple-10-5-ipad-pro-64-gb-space-grey-2017.jpg', NULL, 5, 9, 'PRD00007', 'Active', '2026-06-02 09:38:39'),
(8, 2, 'ASUS Transformer Mini T102HA', 'ASUS laptop', 'asus-transformer-mini-t102ha-10-1-2-1-silver', 549.99, 'asus-transformer-mini-t102ha-10-1-2-1-silver.jpg', NULL, 1, 10, 'PRD00008', 'Active', '2026-06-02 09:38:39'),
(9, 2, 'PC SPECIALIST Vortex Core Lite', 'Gaming PC', 'pc-specialist-vortex-core-lite-gaming-pc', 599.99, 'pc-specialist-vortex-core-lite-gaming-pc.jpg', NULL, 4, 11, 'PRD00009', 'Active', '2026-06-02 09:38:39'),
(10, 2, 'DELL Inspiron 5675 Gaming PC', 'Gaming desktop', 'dell-inspiron-5675-gaming-pc-recon-blue', 599.99, 'dell-inspiron-5675-gaming-pc-recon-blue.jpg', '2018-05-10', 1, 10, 'PRD00010', 'Active', '2026-06-02 09:38:39'),
(11, 2, 'HP Barebones OMEN X', 'Gaming PC', 'hp-barebones-omen-x-900-099nn-gaming-pc', 489.98, 'hp-barebones-omen-x-900-099nn-gaming-pc.jpg', '2018-05-12', 4, 7, 'PRD00011', 'Active', '2026-06-02 09:38:39'),
(12, 2, 'ACER Aspire GX-781', 'Gaming PC', 'acer-aspire-gx-781-gaming-pc', 749.99, 'acer-aspire-gx-781-gaming-pc.jpg', '2018-05-12', 3, 10, 'PRD00012', 'Active', '2026-06-02 09:38:39'),
(13, 2, 'HP Pavilion Power 580', 'Gaming PC', 'hp-pavilion-power-580-015na-gaming-pc', 799.99, 'hp-pavilion-power-580-015na-gaming-pc.jpg', '2018-05-12', 1, 9, 'PRD00013', 'Active', '2026-06-02 09:38:39'),
(14, 2, 'LENOVO Legion Y520', 'Gaming PC', 'lenovo-legion-y520-gaming-pc', 899.99, 'lenovo-legion-y520-gaming-pc.jpg', '2018-05-10', 13, 9, 'PRD00014', 'Active', '2026-06-02 09:38:39'),
(15, 2, 'PC SPECIALIST Vortex Minerva XT-R', 'Gaming PC', 'pc-specialist-vortex-minerva-xt-r-gaming-pc', 999.99, 'pc-specialist-vortex-minerva-xt-r-gaming-pc.jpg', '2018-07-09', 5, 33, 'PRD00015', 'Active', '2026-06-02 09:38:39'),
(16, 2, 'PC SPECIALIST Vortex Core II', 'Gaming PC', 'pc-specialist-vortex-core-ii-gaming-pc', 649.99, 'pc-specialist-vortex-core-ii-gaming-pc.jpg', '2018-05-10', 3, 100, 'PRD00016', 'Active', '2026-06-02 09:38:39'),
(17, 11, 'AMAZON Fire 7 Tablet', 'Amazon tablet', 'amazon-fire-7-tablet-alexa-2017-8-gb-black', 49.99, 'amazon-fire-7-tablet-alexa-2017-8-gb-black.jpg', '2018-05-12', 1, 9, 'PRD00017', 'Active', '2026-06-02 09:38:39'),
(18, 11, 'AMAZON Fire HD 8 Tablet 16GB', 'Amazon tablet', 'amazon-fire-hd-8-tablet-alexa-2017-16-gb-black', 79.99, 'amazon-fire-hd-8-tablet-alexa-2017-16-gb-black.jpg', '2018-05-12', 3, 20, 'PRD00018', 'Active', '2026-06-02 09:38:39'),
(19, 11, 'AMAZON Fire HD 8 Tablet 32GB', 'Amazon tablet', 'amazon-fire-hd-8-tablet-alexa-2017-32-gb-black', 99.99, 'amazon-fire-hd-8-tablet-alexa-2017-32-gb-black.jpg', '2018-05-10', 7, 20, 'PRD00019', 'Active', '2026-06-02 09:38:39'),
(20, 10, 'APPLE iPad 32GB Space Grey', 'Apple tablet', 'apple-9-7-ipad-32-gb-space-grey', 339, 'apple-9-7-ipad-32-gb-space-grey.jpg', '2018-05-12', 19, 10, 'PRD00020', 'Active', '2026-06-02 09:38:39'),
(21, 2, 'Dell XPS 15 9560', 'Premium Dell laptop', 'dell-xps-15-9560', 1599, 'dell-xps-15-9560.jpg', '2018-07-09', 28, 99, 'PRD00021', 'Active', '2026-06-02 09:38:39'),
(22, 10, 'Samsung Note 8', 'Samsung smartphone', 'samsung-note-8', 829, 'samsung-note-8.jpg', NULL, 14, 89, 'PRD00022', 'Active', '2026-06-02 09:38:39'),
(23, 10, 'Samsung Galaxy S9+ 128GB', 'Samsung smartphone', 'samsung-galaxy-s9-128-gb', 889.99, 'samsung-galaxy-s9-128-gb.jpg', '2018-07-09', 25, 100, 'PRD00023', 'Active', '2026-06-02 09:38:39');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(180) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `title` varchar(160) DEFAULT NULL,
  `comment` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Approved',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 20, 1, 5, '', 'dfdf', 'Approved', '2026-06-06 04:52:59', '2026-06-06 04:52:59'),
(2, 20, 1, 4, '', 'Good Product', 'Approved', '2026-06-06 06:33:04', '2026-06-06 06:33:04'),
(3, 20, 1, 4, '', 'Nice Product', 'Approved', '2026-06-06 06:33:32', '2026-06-06 06:33:32'),
(4, 23, 1, 5, 'Good Product', 'Good Product\n', 'Approved', '2026-06-06 08:55:09', '2026-06-06 08:55:09'),
(5, 20, 1, 5, '', 'Hello review', 'Approved', '2026-06-21 06:09:14', '2026-06-21 06:09:14');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone_number` varchar(30) NOT NULL,
  `subject` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `name`, `email`, `phone_number`, `subject`, `message`, `status`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', '01919926637', 'Order id: 3', 'What is the update?', 'Open', NULL, '2026-06-06 05:24:57', '2026-06-06 05:24:57'),
(2, 1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', '01919926637', 'dd', '21/6/2026 oders status ta ki?', 'Open', NULL, '2026-06-21 06:09:49', '2026-06-21 06:09:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_name` text NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(60) NOT NULL,
  `type` int(1) DEFAULT 0,
  `location` text DEFAULT NULL,
  `phone_number` varchar(100) DEFAULT NULL,
  `photo` varchar(200) DEFAULT 'default.jpg',
  `status` int(1) DEFAULT 1,
  `activate_code` varchar(15) DEFAULT NULL,
  `reset_code` varchar(15) DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_name`, `email`, `password`, `type`, `location`, `phone_number`, `photo`, `status`, `activate_code`, `reset_code`, `created_at`, `full_name`, `address`, `city`) VALUES
(1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', 'sajid45139', 0, 'Bangshal', '01919926637', 'default.jpg', 1, NULL, NULL, '2026-06-02', 'Md. Sajidur Rahman', 'Bangshal', 'Dhaka.'),
(2, 'Md. Rakib Islam', 'rakibeshan99@gmail.com', '1234', 0, 'Dhaka', '402', 'default.jpg', 1, NULL, NULL, '2026-06-03', 'Md. Rakib Islam', 'Dhaka', 'Dhaka'),
(3, 'Md. Rafid', 'rafid@gmail.com', 'rafid', 0, 'Dhaka\n', '01678862200', 'default.jpg', 1, NULL, NULL, '2026-06-03', 'Md. Rafid', 'Dhaka\n', 'Dhaka'),
(4, 'M M Hasan', 'mmhasan@gmail.com', '65778', 0, 'dhaka', '0122443432', 'default.jpg', 1, NULL, NULL, '2026-06-04', 'M M Hasan', 'dhaka', 'vatara'),
(5, 'Niloy', 'niloy@gmail.com', 'sajid45139', 0, 'D', '01678862201', 'default.jpg', 1, NULL, NULL, '2026-06-06', 'Niloy', 'D', 'Dhaka');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` enum('Home','Office') DEFAULT 'Home',
  `recipient_name` varchar(150) NOT NULL,
  `phone_number` varchar(30) NOT NULL,
  `address_line` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `label`, `recipient_name`, `phone_number`, `address_line`, `city`, `area`, `postal_code`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Home', 'Md. Sajidur Rahman', '01919926637', 'Bangshal', 'Dhaka.', '', '', 1, '2026-06-06 06:34:59', '2026-06-06 06:34:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cat_code` (`cat_code`);

--
-- Indexes for table `details`
--
ALTER TABLE `details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_id` (`sales_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `details`
--
ALTER TABLE `details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `details`
--
ALTER TABLE `details`
  ADD CONSTRAINT `details_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
