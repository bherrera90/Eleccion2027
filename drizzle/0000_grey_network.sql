CREATE TABLE `codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`survey_id` integer NOT NULL,
	`code` text NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `codes_code_unique` ON `codes` (`code`);--> statement-breakpoint
CREATE INDEX `codes_survey_idx` ON `codes` (`survey_id`);--> statement-breakpoint
CREATE TABLE `options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`survey_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tag` text NOT NULL,
	`image_path` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `options_survey_position_unique` ON `options` (`survey_id`,`position`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`code_id` integer,
	`role` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`code_id`) REFERENCES `codes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_code_idx` ON `sessions` (`code_id`);--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`is_open` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `surveys_slug_unique` ON `surveys` (`slug`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`survey_id` integer NOT NULL,
	`option_id` integer NOT NULL,
	`code_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`code_id`) REFERENCES `codes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_code_unique` ON `votes` (`code_id`);--> statement-breakpoint
CREATE INDEX `votes_option_idx` ON `votes` (`option_id`);