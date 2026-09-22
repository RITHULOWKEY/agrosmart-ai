CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldId` int,
	`type` varchar(48) NOT NULL,
	`severity` enum('high','medium','low') NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`read` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(240) NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(48),
	`subject` varchar(160) NOT NULL,
	`category` varchar(48) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`location` varchar(240) NOT NULL,
	`soilType` varchar(80) NOT NULL,
	`area` varchar(80) NOT NULL,
	`crop` varchar(80) NOT NULL,
	`plantingDate` varchar(32) NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pilotApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`phone` varchar(48) NOT NULL,
	`email` varchar(320) NOT NULL,
	`location` varchar(240) NOT NULL,
	`farmSize` varchar(80) NOT NULL,
	`crop` varchar(80) NOT NULL,
	`experience` varchar(80),
	`soilType` varchar(80),
	`preferredLanguage` varchar(32) NOT NULL DEFAULT 'English',
	`consent` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pilotApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldId` int NOT NULL,
	`waterMm` int NOT NULL,
	`wateringTime` varchar(64) NOT NULL,
	`confidence` int NOT NULL,
	`harvestRecommendation` varchar(160) NOT NULL,
	`agentResults` text NOT NULL,
	`reasoning` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(32) DEFAULT 'English' NOT NULL;