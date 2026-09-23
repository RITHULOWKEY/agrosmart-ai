ALTER TABLE `cropAnalyses` MODIFY COLUMN `wateringAdvice` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `location` varchar(240);--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `growthStage` varchar(100);--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `currentSymptoms` text;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `previousTreatment` text;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `imageKey` varchar(255);--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `detectedCondition` varchar(240) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `immediateAction` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `soilGuidance` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `pestDiseaseManagement` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `preventiveMeasures` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `sustainableFarming` varchar(800) NOT NULL;--> statement-breakpoint
ALTER TABLE `cropAnalyses` ADD `providerModel` varchar(120);--> statement-breakpoint
ALTER TABLE `galleryItems` ADD `imageKey` varchar(255);