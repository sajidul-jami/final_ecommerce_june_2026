-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 06:25 AM
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
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(150) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `status`, `created_at`) VALUES
(1, 'Dell', 'Dell', '', 'Active', '2026-06-29 09:28:53');

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
(11, 'Tablet', 'tablet', '000-003', '000', '2026-06-06 06:00:16'),
(12, 'Male', 'agun er gola', '001-001', '001', '2026-06-25 10:42:36'),
(13, 'Baby', 'baby', '001-001-001', '001-001', '2026-06-28 08:39:42'),
(14, 'Skincare', 'skincare', '002', NULL, '2026-06-28 08:42:01'),
(15, 'Hair Care', 'hair care', '003', NULL, '2026-06-28 08:42:21'),
(17, 'Makeup', 'Makeup', '004', NULL, '2026-06-28 08:42:43'),
(18, 'Organic', 'Organic/Natural beauty', '005', NULL, '2026-06-28 08:43:07'),
(19, 'Men\'s grooming', 'Men\'s grooming', '006', NULL, '2026-06-28 08:43:19'),
(20, 'Baby care', 'Baby care', '007', NULL, '2026-06-28 08:43:30'),
(21, 'Young', 'Young', '001-001-002', '001-001', '2026-06-28 08:52:57'),
(22, 'Man', 'man', '001-001-003', '001-001', '2026-06-28 08:53:18'),
(23, 'Female', 'female', '001-002', '001', '2026-06-28 08:53:48'),
(25, 'Female-Baby', 'femail baby', '001-002-001', '001-002', '2026-06-29 12:05:10');

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
(37, 26, 20, 8, 339.00),
(38, 27, 21, 1, 1599.00),
(39, 27, 14, 1, 899.99),
(40, 27, 6, 1, 449.99),
(41, 28, 22, 1, 829.00),
(42, 29, 15, 1, 999.99),
(43, 30, 21, 1, 1599.00),
(44, 31, 20, 1, 339.00),
(45, 32, 21, 1, 1599.00),
(46, 33, 22, 1, 829.00),
(47, 34, 22, 1, 829.00),
(48, 35, 32, 1, 100.00),
(49, 36, 23, 1, 889.99),
(50, 36, 22, 1, 829.00),
(51, 36, 21, 1, 1599.00),
(52, 37, 20, 1, 339.00),
(53, 38, 21, 1, 1599.00),
(54, 39, 22, 4, 829.00),
(55, 40, 22, 1, 829.00),
(56, 41, 22, 1, 829.00),
(57, 42, 23, 1, 889.99),
(58, 42, 22, 2, 829.00),
(59, 42, 21, 2, 1599.00),
(60, 42, 20, 2, 339.00),
(61, 42, 19, 1, 99.99),
(62, 42, 18, 1, 79.99),
(63, 42, 17, 1, 49.99),
(64, 42, 16, 1, 649.99),
(65, 42, 15, 1, 999.99),
(66, 43, 21, 1, 1599.00),
(67, 44, 22, 1, 829.00),
(68, 45, 3, 1, 599.00),
(69, 46, 6, 1, 449.99);

-- --------------------------------------------------------

--
-- Table structure for table `homepage_sections`
--

CREATE TABLE `homepage_sections` (
  `id` int(11) NOT NULL,
  `section_name` varchar(100) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `offer_type` varchar(80) NOT NULL DEFAULT 'Special Offers',
  `badge_text` varchar(40) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `discount_type` enum('Flat','Percentage') DEFAULT NULL,
  `discount_value` double NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `title`, `offer_type`, `badge_text`, `product_id`, `discount_type`, `discount_value`, `start_date`, `end_date`, `status`, `sort_order`) VALUES
(42, 'Flash Sale', 'Flash Sale', '', 1, 'Percentage', 10, NULL, NULL, 'Active', 1),
(43, 'Flash Sale', 'Flash Sale', '', 2, 'Percentage', 10, NULL, NULL, 'Active', 1),
(44, 'Flash Sale', 'Flash Sale', '', 3, 'Percentage', 10, NULL, NULL, 'Active', 1),
(45, 'Flash Sale', 'Flash Sale', '', 4, 'Percentage', 10, NULL, NULL, 'Active', 1),
(46, 'Flash Sale', 'Flash Sale', '', 5, 'Percentage', 10, NULL, NULL, 'Active', 1),
(47, 'Flash Sale', 'Flash Sale', '', 6, 'Percentage', 10, NULL, NULL, 'Active', 1),
(48, 'Flash Sale', 'Flash Sale', '', 7, 'Percentage', 10, NULL, NULL, 'Active', 1),
(49, 'Flash Sale', 'Flash Sale', '', 8, 'Percentage', 10, NULL, NULL, 'Active', 1),
(50, 'Flash Sale', 'Flash Sale', '', 9, 'Percentage', 10, NULL, NULL, 'Active', 1),
(51, 'Flash Sale', 'Flash Sale', '', 10, 'Percentage', 10, NULL, NULL, 'Active', 1),
(52, 'Flash Sale', 'Flash Sale', '', 11, 'Percentage', 10, NULL, NULL, 'Active', 1),
(53, 'Flash Sale', 'Flash Sale', '', 12, 'Percentage', 10, NULL, NULL, 'Active', 1),
(54, 'Flash Sale', 'Flash Sale', '', 13, 'Percentage', 10, NULL, NULL, 'Active', 1),
(55, 'Flash Sale', 'Flash Sale', '', 14, 'Percentage', 10, NULL, NULL, 'Active', 1),
(56, 'Flash Sale', 'Flash Sale', '', 15, 'Percentage', 10, NULL, NULL, 'Active', 1),
(57, 'Flash Sale', 'Flash Sale', '', 16, 'Percentage', 10, NULL, NULL, 'Active', 1),
(58, 'Flash Sale', 'Flash Sale', '', 17, 'Percentage', 10, NULL, NULL, 'Active', 1),
(59, 'Special Offers', 'Special Offers', '', 18, 'Flat', 20, NULL, NULL, 'Active', 2),
(60, 'Special Offers', 'Special Offers', '', 19, 'Flat', 20, NULL, NULL, 'Active', 2),
(61, 'Special Offers', 'Special Offers', '', 20, 'Flat', 20, NULL, NULL, 'Active', 2),
(62, 'Special Offers', 'Special Offers', '', 21, 'Flat', 20, NULL, NULL, 'Active', 2),
(63, 'Special Offers', 'Special Offers', '', 22, 'Flat', 20, NULL, NULL, 'Active', 2),
(64, 'Special Offers', 'Special Offers', '', 23, 'Flat', 20, NULL, NULL, 'Active', 2),
(65, 'Special Offers', 'Special Offers', '', 32, 'Flat', 20, NULL, NULL, 'Active', 2);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('Cash On Delivery','Card','Bkash','Nagad') DEFAULT NULL,
  `order_status` enum('Pending','Processing','Completed','Cancelled') DEFAULT 'Pending',
  `delivery_address_id` int(11) DEFAULT NULL,
  `delivery_name` varchar(100) DEFAULT NULL,
  `delivery_phone` varchar(30) DEFAULT NULL,
  `delivery_email` varchar(200) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `delivery_city` varchar(100) DEFAULT NULL,
  `delivery_area` varchar(100) DEFAULT NULL,
  `order_notes` text DEFAULT NULL,
  `checkout_type` enum('user','guest') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `total_amount`, `payment_method`, `order_status`, `delivery_address_id`, `delivery_name`, `delivery_phone`, `delivery_email`, `delivery_address`, `delivery_city`, `delivery_area`, `order_notes`, `checkout_type`, `created_at`) VALUES
(1, 1, 1698.00, 'Cash On Delivery', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-02 09:51:17'),
(2, 1, 489.98, 'Cash On Delivery', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-02 10:28:47'),
(3, 1, 799.99, 'Cash On Delivery', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-02 10:49:32'),
(4, 1, 2197.99, 'Cash On Delivery', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-02 10:51:08'),
(5, 2, 989.98, 'Cash On Delivery', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 03:23:11'),
(6, 2, 1.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 04:53:28'),
(7, 2, 339.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 05:08:53'),
(8, 2, 1469.94, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 05:10:12'),
(9, 2, 829.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 05:48:49'),
(10, 2, 1599.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 05:49:26'),
(11, 3, 339.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 07:12:20'),
(12, 3, 1007.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 07:12:57'),
(13, 1, 549.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 08:21:33'),
(14, 1, 79.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 09:22:58'),
(15, 2, 899.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 09:27:25'),
(16, 2, 41347.89, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 09:29:31'),
(17, 1, 899.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 11:09:37'),
(18, 1, 339.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 11:10:22'),
(19, 1, 79.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-03 11:21:30'),
(20, 4, 749.99, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-04 10:25:38'),
(21, 4, 1849.96, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-04 10:42:36'),
(22, 1, 339.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-06 05:23:54'),
(23, 1, 1000.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-06 05:48:55'),
(24, 1, 4145.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-06 06:34:37'),
(25, 5, 1599.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-06 06:48:20'),
(26, 1, 7686.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-07 10:31:08'),
(27, 6, 2948.98, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-21 11:29:29'),
(28, 6, 829.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-24 05:18:51'),
(29, 7, 999.99, 'Cash On Delivery', 'Processing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-24 11:52:22'),
(30, 7, 1599.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-29 06:43:25'),
(31, 1, 339.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-29 06:58:41'),
(32, 1, 1599.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-29 07:50:02'),
(33, 1, 829.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-29 08:55:52'),
(34, 1, 829.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-29 09:35:13'),
(35, 7, 100.00, 'Cash On Delivery', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2026-06-30 10:54:02'),
(36, NULL, 3317.99, 'Cash On Delivery', 'Pending', NULL, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', '62/64, Mahuttuli bangsahl dhaka.', 'Dhaka', 'Bangshal', 'Need today.', 'guest', '2026-07-02 04:57:47'),
(37, NULL, 339.00, 'Cash On Delivery', 'Pending', NULL, 'Md. Sajidur Rahman', '01678862200', NULL, '224', 'Dhaka', NULL, NULL, 'guest', '2026-07-02 04:58:42'),
(38, 1, 1599.00, 'Cash On Delivery', 'Pending', 1, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', 'Bangshal', 'Dhaka.', NULL, NULL, 'user', '2026-07-02 05:29:05'),
(39, NULL, 3316.00, 'Cash On Delivery', 'Pending', NULL, 'Md. Ali', '01919926637', NULL, '789', 'Dhaka', NULL, NULL, 'guest', '2026-07-02 05:38:23'),
(40, NULL, 829.00, 'Cash On Delivery', 'Pending', NULL, 'dff', 'dfdfd', NULL, 'fdfd', 'fdfdf', NULL, NULL, 'guest', '2026-07-02 05:39:22'),
(41, 1, 829.00, 'Cash On Delivery', 'Pending', 1, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', 'Bangshal', 'Dhaka.', NULL, NULL, 'user', '2026-07-02 05:40:04'),
(42, NULL, 8303.94, 'Cash On Delivery', 'Pending', NULL, 'Test order Place', '01919926637', NULL, 'Komu na', 'Dhakar chaka', NULL, 'Dibi kina bol!!!', 'guest', '2026-07-02 05:48:04'),
(43, 1, 1599.00, 'Cash On Delivery', 'Pending', 1, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', 'Bangshal', 'Dhaka.', NULL, NULL, 'user', '2026-07-02 09:57:49'),
(44, 1, 829.00, 'Cash On Delivery', 'Pending', 1, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', 'Bangshal', 'Dhaka.', NULL, NULL, 'user', '2026-07-02 10:00:47'),
(45, 1, 599.00, 'Cash On Delivery', 'Pending', 1, 'Md. Sajidur Rahman', '01919926637', 'sajidul.jami@gmail.com', 'Bangshal', 'Dhaka.', NULL, NULL, 'user', '2026-07-02 11:14:22'),
(46, 5, 449.99, 'Cash On Delivery', 'Pending', NULL, 'Niloy', '01678862201', 'niloy@gmail.com', 'D', 'Dhaka', NULL, NULL, 'user', '2026-07-02 11:26:47');

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
(26, 26, 'COD-26', 7686.00, 'Unpaid', '2026-06-07 10:31:08'),
(27, 27, 'COD-27', 2948.98, 'Unpaid', '2026-06-21 11:29:29'),
(28, 28, 'COD-28', 829.00, 'Unpaid', '2026-06-24 05:18:51'),
(29, 29, 'COD-29', 999.99, 'Unpaid', '2026-06-24 11:52:22'),
(30, 30, 'COD-30', 1599.00, 'Unpaid', '2026-06-29 06:43:25'),
(31, 31, 'COD-31', 339.00, 'Unpaid', '2026-06-29 06:58:41'),
(32, 32, 'COD-32', 1599.00, 'Unpaid', '2026-06-29 07:50:02'),
(33, 33, 'COD-33', 829.00, 'Unpaid', '2026-06-29 08:55:52'),
(34, 34, 'COD-34', 829.00, 'Unpaid', '2026-06-29 09:35:13'),
(35, 35, 'COD-35', 100.00, 'Unpaid', '2026-06-30 10:54:02'),
(36, 36, 'COD-36', 3317.99, 'Unpaid', '2026-07-02 04:57:47'),
(37, 37, 'COD-37', 339.00, 'Unpaid', '2026-07-02 04:58:42'),
(38, 38, 'COD-38', 1599.00, 'Unpaid', '2026-07-02 05:29:05'),
(39, 39, 'COD-39', 3316.00, 'Unpaid', '2026-07-02 05:38:23'),
(40, 40, 'COD-40', 829.00, 'Unpaid', '2026-07-02 05:39:22'),
(41, 41, 'COD-41', 829.00, 'Unpaid', '2026-07-02 05:40:04'),
(42, 42, 'COD-42', 8303.94, 'Unpaid', '2026-07-02 05:48:04'),
(43, 43, 'COD-43', 1599.00, 'Unpaid', '2026-07-02 09:57:49'),
(44, 44, 'COD-44', 829.00, 'Unpaid', '2026-07-02 10:00:47'),
(45, 45, 'COD-45', 599.00, 'Unpaid', '2026-07-02 11:14:22'),
(46, 46, 'COD-46', 449.99, 'Unpaid', '2026-07-02 11:26:47');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `brand_id` int(11) DEFAULT NULL,
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

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `description`, `slug`, `price`, `photo`, `date_view`, `counter`, `quantity`, `sku`, `status`, `created_at`) VALUES
(1, 2, 1, 'DELL Inspiron 15 7000 15.6', 'Dell gaming laptop', 'dell-inspiron-15-7000-15-6', 8990, 'dell-inspiron-15-7000-15-6.jpg', '2018-07-09', 6, 4300, 'PRD00001', 'Active', '2026-06-02 09:38:39'),
(2, 2, NULL, 'MICROSOFT Surface Pro 4 & Typecover - 128 GB', 'Microsoft Surface tablet', 'microsoft-surface-pro-4-typecover-128-gb', 799, 'microsoft-surface-pro-4-typecover-128-gb.jpg', '2018-05-10', 5, 8, 'PRD00002', 'Active', '2026-06-02 09:38:39'),
(3, 2, 1, 'DELL Inspiron 15 5000 15.6', 'Dell laptop', 'dell-inspiron-15-5000-15-6', 599, 'dell-inspiron-15-5000-15-6.jpg', '2018-05-12', 5, 10, 'PRD00003', 'Active', '2026-06-02 09:38:39'),
(4, 2, NULL, 'LENOVO Ideapad 320s-14IKB', 'Lenovo laptop', 'lenovo-ideapad-320s-14ikb-14-laptop-grey', 399, 'lenovo-ideapad-320s-14ikb-14-laptop-grey.jpg', '2018-05-10', 4, 11, 'PRD00004', 'Active', '2026-06-02 09:38:39'),
(5, 11, NULL, 'APPLE 9.7 iPad 32GB Gold', 'Apple tablet', 'apple-9-7-ipad-32-gb-gold', 339, 'apple-9-7-ipad-32-gb-gold.jpg', '2018-07-09', 10, 10, 'PRD00005', 'Active', '2026-06-02 09:38:39'),
(6, 2, 1, 'DELL Inspiron 15 5000 15', 'Dell laptop', 'dell-inspiron-15-5000-15', 449.99, 'dell-inspiron-15-5000-15.jpg', NULL, 2, 9, 'PRD00006', 'Active', '2026-06-02 09:38:39'),
(7, 10, NULL, 'APPLE 10.5 iPad Pro 64GB', 'Apple tablet', 'apple-10-5-ipad-pro-64-gb-space-grey-2017', 619, 'apple-10-5-ipad-pro-64-gb-space-grey-2017.jpg', NULL, 5, 9, 'PRD00007', 'Active', '2026-06-02 09:38:39'),
(8, 2, NULL, 'ASUS Transformer Mini T102HA', 'ASUS laptop', 'asus-transformer-mini-t102ha-10-1-2-1-silver', 549.99, 'asus-transformer-mini-t102ha-10-1-2-1-silver.jpg', NULL, 1, 10, 'PRD00008', 'Active', '2026-06-02 09:38:39'),
(9, 2, NULL, 'PC SPECIALIST Vortex Core Lite', 'Gaming PC', 'pc-specialist-vortex-core-lite-gaming-pc', 599.99, 'pc-specialist-vortex-core-lite-gaming-pc.jpg', NULL, 4, 11, 'PRD00009', 'Active', '2026-06-02 09:38:39'),
(10, 2, NULL, 'DELL Inspiron 5675 Gaming PC', 'Gaming desktop', 'dell-inspiron-5675-gaming-pc-recon-blue', 599.99, 'dell-inspiron-5675-gaming-pc-recon-blue.jpg', '2018-05-10', 5, 10, 'PRD00010', 'Active', '2026-06-02 09:38:39'),
(11, 2, NULL, 'HP Barebones OMEN X', 'Gaming PC', 'hp-barebones-omen-x-900-099nn-gaming-pc', 489.98, 'hp-barebones-omen-x-900-099nn-gaming-pc.jpg', '2018-05-12', 5, 7, 'PRD00011', 'Active', '2026-06-02 09:38:39'),
(12, 2, NULL, 'ACER Aspire GX-781', 'Gaming PC', 'acer-aspire-gx-781-gaming-pc', 749.99, 'acer-aspire-gx-781-gaming-pc.jpg', '2018-05-12', 3, 10, 'PRD00012', 'Active', '2026-06-02 09:38:39'),
(13, 2, NULL, 'HP Pavilion Power 580', 'Gaming PC', 'hp-pavilion-power-580-015na-gaming-pc', 799.99, 'hp-pavilion-power-580-015na-gaming-pc.jpg', '2018-05-12', 1, 9, 'PRD00013', 'Active', '2026-06-02 09:38:39'),
(14, 2, NULL, 'LENOVO Legion Y520', 'Gaming PC', 'lenovo-legion-y520-gaming-pc', 899.99, 'lenovo-legion-y520-gaming-pc.jpg', '2018-05-10', 16, 8, 'PRD00014', 'Active', '2026-06-02 09:38:39'),
(15, 2, NULL, 'PC SPECIALIST Vortex Minerva XT-R', 'Gaming PC', 'pc-specialist-vortex-minerva-xt-r-gaming-pc', 999.99, 'pc-specialist-vortex-minerva-xt-r-gaming-pc.jpg', '2018-07-09', 5, 31, 'PRD00015', 'Active', '2026-06-02 09:38:39'),
(16, 2, NULL, 'PC SPECIALIST Vortex Core II', 'Gaming PC', 'pc-specialist-vortex-core-ii-gaming-pc', 649.99, 'pc-specialist-vortex-core-ii-gaming-pc.jpg', '2018-05-10', 4, 99, 'PRD00016', 'Active', '2026-06-02 09:38:39'),
(17, 11, NULL, 'AMAZON Fire 7 Tablet', 'Amazon tablet', 'amazon-fire-7-tablet-alexa-2017-8-gb-black', 49.99, 'amazon-fire-7-tablet-alexa-2017-8-gb-black.jpg', '2018-05-12', 2, 8, 'PRD00017', 'Active', '2026-06-02 09:38:39'),
(18, 11, NULL, 'AMAZON Fire HD 8 Tablet 16GB', 'Amazon tablet', 'amazon-fire-hd-8-tablet-alexa-2017-16-gb-black', 79.99, 'amazon-fire-hd-8-tablet-alexa-2017-16-gb-black.jpg', '2018-05-12', 5, 19, 'PRD00018', 'Active', '2026-06-02 09:38:39'),
(19, 11, NULL, 'AMAZON Fire HD 8 Tablet 32GB', 'Amazon tablet', 'amazon-fire-hd-8-tablet-alexa-2017-32-gb-black', 99.99, 'amazon-fire-hd-8-tablet-alexa-2017-32-gb-black.jpg', '2018-05-10', 9, 19, 'PRD00019', 'Active', '2026-06-02 09:38:39'),
(20, 10, NULL, 'APPLE iPad 32GB Space Grey', 'Apple tablet', 'apple-9-7-ipad-32-gb-space-grey', 339, 'apple-9-7-ipad-32-gb-space-grey.jpg', '2018-05-12', 28, 6, 'PRD00020', 'Active', '2026-06-02 09:38:39'),
(21, 2, NULL, 'Dell XPS 15 9560', 'Premium Dell laptop', 'dell-xps-15-9560', 1599, 'dell-xps-15-9560.jpg', '2018-07-09', 38, 91, 'PRD00021', 'Active', '2026-06-02 09:38:39'),
(22, 10, NULL, 'Samsung Note 8', 'Samsung smartphone', 'samsung-note-8', 829, 'samsung-note-8.jpg', NULL, 21, 76, 'PRD00022', 'Active', '2026-06-02 09:38:39'),
(23, 10, NULL, 'Samsung Galaxy S9+ 128GB', 'Samsung smartphone', 'samsung-galaxy-s9-128-gb', 889.99, 'samsung-galaxy-s9-128-gb.jpg', '2018-07-09', 32, 98, 'PRD00023', 'Active', '2026-06-02 09:38:39'),
(32, 22, 1, 'Md. Sajidur Rahman', 'Sajid is a smart, kind, and hardworking boy. He is a student who studies in school and always tries to do his best in his studies. He is very punctual and attends his classes regularly. His teachers appreciate him because he is respectful, disciplined, and eager to learn.\n\nSajid lives with his family and loves his parents very much. He always obeys his parents and helps them with household tasks whenever possible. He is also caring toward his younger brothers and sisters and enjoys spending time with his family.\n\nIn school, Sajid is friendly and helpful. He gets along well with his classmates and is always ready to help anyone who faces difficulties in lessons. Because of his good manners and positive attitude, he is liked by both teachers and friends.\n\nSajid has many hobbies. He enjoys reading storybooks, playing football, drawing pictures, and watching educational programs. During his free time, he likes learning new things and improving his skills. He believes that hard work and dedication are the keys to success.\n\nSajid is also conscious of his health. He exercises regularly, eats healthy food, and participates in sports activities. These habits keep him active and energetic.\n\nHis dream is to become a successful person in the future and serve his country. He works hard every day to achieve his goals. Sajid is an example of a good student and a responsible young person. His honesty, kindness, and determination inspire others to become better individuals.', NULL, 100, 'For linkedin.jpg', NULL, 28, 0, 'sajid', 'Active', '2026-06-29 11:40:08');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `admin_reply` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0
) ;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `status`, `created_at`, `updated_at`, `admin_reply`, `is_verified_purchase`) VALUES
(1, 20, 1, 5, '', 'dfdf', 'Approved', '2026-06-06 04:52:59', '2026-06-06 04:52:59', NULL, 0),
(2, 20, 1, 4, '', 'Good Product', 'Approved', '2026-06-06 06:33:04', '2026-06-06 06:33:04', NULL, 0),
(3, 20, 1, 4, '', 'Nice Product', 'Approved', '2026-06-06 06:33:32', '2026-06-06 06:33:32', NULL, 0),
(4, 23, 1, 5, 'Good Product', 'Good Product\n', 'Approved', '2026-06-06 08:55:09', '2026-06-06 08:55:09', NULL, 0),
(5, 20, 1, 5, '', 'Hello review', 'Approved', '2026-06-21 06:09:14', '2026-06-30 10:53:15', 'Thank you for your review\n', 0),
(6, 32, 7, 5, '', 'Very Good man', 'Pending', '2026-06-30 10:53:48', '2026-06-30 10:54:20', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `tag_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `button_text` varchar(50) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `assigned_admin` int(11) DEFAULT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `name`, `email`, `phone_number`, `subject`, `message`, `status`, `admin_note`, `created_at`, `updated_at`, `assigned_admin`, `priority`) VALUES
(1, 1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', '01919926637', 'Order id: 3', 'What is the update?', 'Open', NULL, '2026-06-06 05:24:57', '2026-06-06 05:24:57', NULL, 'Medium'),
(2, 1, 'Md. Sajidur Rahman', 'sajidul.jami@gmail.com', '01919926637', 'dd', '21/6/2026 oders status ta ki?', 'Open', NULL, '2026-06-21 06:09:49', '2026-06-21 06:09:49', NULL, 'Medium'),
(3, NULL, 'Sajidul Jami', 'sajidul.jami@gmail.com', 'Sajid', 'Komu na', 'Komu na', 'Open', NULL, '2026-06-21 11:50:47', '2026-06-21 11:50:47', NULL, 'Medium'),
(4, NULL, 'Sajidul Jami', 'sajidul.jami@gmail.com', 'Sajid', 'Hi', 'Hi', 'Open', NULL, '2026-06-21 11:50:55', '2026-06-21 11:50:55', NULL, 'Medium');

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
(5, 'Niloy', 'niloy@gmail.com', 'sajid45139', 0, 'D', '01678862201', 'default.jpg', 1, NULL, NULL, '2026-06-06', 'Niloy', 'D', 'Dhaka'),
(6, 'Md. Rafidul Rafi', 'rafidul.rafi@gmail.com', 'sajid45139', 0, 'komu na', '01678862202', 'default.jpg', 1, NULL, NULL, '2026-06-21', 'Md. Rafidul Rafi', 'komu na', 'Dhaka'),
(7, '24_june_2026', 'sajidnew@gmail.com', '2344', 0, 'koitam na', '2344', 'default.jpg', 1, NULL, NULL, '2026-06-24', '24_june_2026', 'koitam na', 'na');

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
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

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
  ADD UNIQUE KEY `cat_code` (`cat_code`),
  ADD KEY `idx_category_name_slug_code` (`name`,`cat_slug`,`cat_code`);

--
-- Indexes for table `details`
--
ALTER TABLE `details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_id` (`sales_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `homepage_sections`
--
ALTER TABLE `homepage_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_name` (`section_name`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_offers_active_dates` (`status`,`start_date`,`end_date`),
  ADD KEY `idx_offers_type_sort` (`offer_type`,`sort_order`);

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
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_product_brand` (`brand_id`),
  ADD KEY `idx_products_name` (`name`(768)),
  ADD KEY `idx_products_sku` (`sku`);

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
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_product_tags_name` (`tag_name`);

--
-- Indexes for table `sliders`
--
ALTER TABLE `sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_ticket_admin` (`assigned_admin`);

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
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `details`
--
ALTER TABLE `details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `homepage_sections`
--
ALTER TABLE `homepage_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

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
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sliders`
--
ALTER TABLE `sliders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

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
  ADD CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
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
-- Constraints for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD CONSTRAINT `product_tags_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `fk_ticket_admin` FOREIGN KEY (`assigned_admin`) REFERENCES `admins` (`id`),
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
