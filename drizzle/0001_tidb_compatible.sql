CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`logo` varchar(512),
	`favicon` varchar(512),
	`primaryColor` varchar(7) DEFAULT '#000000',
	`secondaryColor` varchar(7) DEFAULT '#FFFFFF',
	`accentColor` varchar(7) DEFAULT '#3B82F6',
	`fontFamily` varchar(100) DEFAULT 'Inter',
	`theme` enum('light','dark','auto') DEFAULT 'light',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `stores_slug_unique` (`slug`),
	KEY `merchantId_idx` (`merchantId`)
);

CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image` varchar(512),
	`parentCategoryId` int,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `storeId_idx` (`storeId`)
);

CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`categoryId` int,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`shortDescription` varchar(500),
	`price` decimal(10,2) NOT NULL,
	`compareAtPrice` decimal(10,2),
	`sku` varchar(255),
	`barcode` varchar(255),
	`quantity` int DEFAULT 0,
	`trackQuantity` boolean DEFAULT true,
	`weight` decimal(8,2),
	`weightUnit` varchar(10) DEFAULT 'kg',
	`isActive` boolean DEFAULT true,
	`images` json,
	`seoTitle` varchar(255),
	`seoDescription` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `storeId_idx` (`storeId`),
	KEY `categoryId_idx` (`categoryId`)
);

CREATE TABLE `productVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`sku` varchar(255),
	`barcode` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`compareAtPrice` decimal(10,2),
	`quantity` int DEFAULT 0,
	`weight` decimal(8,2),
	`image` varchar(512),
	`attributes` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `productId_idx` (`productId`)
);

CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`postalCode` varchar(20),
	`country` varchar(100),
	`totalSpent` decimal(10,2) DEFAULT '0',
	`totalOrders` int DEFAULT 0,
	`lastOrderAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `storeId_idx` (`storeId`),
	KEY `email_idx` (`email`)
);

CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`customerId` int,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) DEFAULT '0',
	`shipping` decimal(10,2) DEFAULT '0',
	`discount` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`shippingAddress` json,
	`billingAddress` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `orders_orderNumber_unique` (`orderNumber`),
	KEY `storeId_idx` (`storeId`),
	KEY `customerId_idx` (`customerId`)
);

CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`variantId` int,
	`title` varchar(255) NOT NULL,
	`sku` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	`total` decimal(10,2) NOT NULL,
	PRIMARY KEY (`id`),
	KEY `orderId_idx` (`orderId`)
);

CREATE TABLE `discounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`type` enum('percentage','fixed_amount') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`minPurchase` decimal(10,2),
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `discounts_code_unique` (`code`),
	KEY `storeId_idx` (`storeId`)
);

CREATE TABLE `storeThemes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`colors` json,
	`typography` json,
	`layout` json,
	`isActive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `storeId_idx` (`storeId`)
);

CREATE TABLE `aiInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`merchantId` int NOT NULL,
	`type` enum('design','product_description','banner','content','layout','general') DEFAULT 'general',
	`prompt` text NOT NULL,
	`response` text,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `storeId_idx` (`storeId`),
	KEY `merchantId_idx` (`merchantId`)
);
