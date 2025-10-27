PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attachments` (
	`id` text,
	`local_path` text,
	`path` text,
	`created_at` integer,
	`created_by` text
);
--> statement-breakpoint
INSERT INTO `__new_attachments`("id", "local_path", "path", "created_at", "created_by") SELECT "id", "local_path", "path", "created_at", "created_by" FROM `attachments`;--> statement-breakpoint
DROP TABLE `attachments`;--> statement-breakpoint
ALTER TABLE `__new_attachments` RENAME TO `attachments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;