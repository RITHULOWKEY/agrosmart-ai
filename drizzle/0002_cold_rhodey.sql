CREATE TABLE `cropAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cropType` varchar(80) NOT NULL,
	`soilType` varchar(80) NOT NULL,
	`plantingDate` varchar(32) NOT NULL,
	`imageUrl` text,
	`healthStatus` varchar(80) NOT NULL,
	`confidence` int NOT NULL,
	`possibleIssue` varchar(160) NOT NULL,
	`severity` varchar(32) NOT NULL,
	`wateringAdvice` varchar(240) NOT NULL,
	`recommendation` text NOT NULL,
	`mode` varchar(32) NOT NULL DEFAULT 'demo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cropAnalyses_id` PRIMARY KEY(`id`)
);
