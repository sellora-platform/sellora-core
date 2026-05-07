CREATE TABLE `aiInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`merchantId` int NOT NULL,
	`type` enum('design','product_description','banner','content','layout','general') DEFAULT 'general',
	`prompt` text NOT NULL,
	`response` text,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image` varchar(512),
	`parentCategoryId` int,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `discounts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
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
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`shippingAddress` json DEFAULT ('{}'),
	`billingAddress` json DEFAULT ('{}'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
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
	`attributes` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productVariants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`images` json DEFAULT ('[]'),
	`seoTitle` varchar(255),
	`seoDescription` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storeThemes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`colors` json DEFAULT ('{}'),
	`typography` json DEFAULT ('{}'),
	`layout` json DEFAULT ('{}'),
	`isActive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeThemes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `aiInteractions` (`storeId`);--> statement-breakpoint
CREATE INDEX `merchantId_idx` ON `aiInteractions` (`merchantId`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `categories` (`storeId`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `customers` (`storeId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `customers` (`email`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `discounts` (`storeId`);--> statement-breakpoint
CREATE INDEX `orderId_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `orders` (`storeId`);--> statement-breakpoint
CREATE INDEX `customerId_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `productId_idx` ON `productVariants` (`productId`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `products` (`storeId`);--> statement-breakpoint
CREATE INDEX `categoryId_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `storeId_idx` ON `storeThemes` (`storeId`);--> statement-breakpoint
CREATE INDEX `merchantId_idx` ON `stores` (`merchantId`);