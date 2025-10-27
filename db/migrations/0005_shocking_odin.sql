CREATE TABLE `attachments` (
	`id)` text,
	`local_path` text,
	`path` text,
	`created_at` text
);
--> statement-breakpoint
ALTER TABLE `customers` ADD `attachment_id` text;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `image_url`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `local_image`;