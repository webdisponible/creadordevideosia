CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` varchar(1024),
	`audioKey` varchar(255),
	`narrativeText` text,
	`selectedStyle` varchar(255) NOT NULL DEFAULT 'cinematographic',
	`isPromptsOnly` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`sceneNumber` int NOT NULL,
	`timeStart` varchar(12) NOT NULL,
	`timeEnd` varchar(12) NOT NULL,
	`audioText` text NOT NULL,
	`imagePrompt` text NOT NULL,
	`animationPrompt` text NOT NULL,
	`sequenceNote` text NOT NULL,
	`imageUrl` varchar(1024),
	`imageKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `style_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`instructions` text NOT NULL,
	`colorPaletteHint` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `style_presets_id` PRIMARY KEY(`id`),
	CONSTRAINT `style_presets_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `visual_bibles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`style` varchar(255) NOT NULL,
	`colorPalette` text NOT NULL,
	`characters` text,
	`environment` text,
	`cinematicStyle` text,
	`coherenceInstructions` text NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visual_bibles_id` PRIMARY KEY(`id`)
);
