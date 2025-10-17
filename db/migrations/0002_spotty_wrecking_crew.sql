PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customers` (
	`id` text,
	`created_at` integer,
	`phone` text,
	`name` text,
	`created_by` text
);
--> statement-breakpoint
INSERT INTO `__new_customers`("id", "created_at", "phone", "name", "created_by") SELECT "id", "created_at", "phone", "name", "created_by" FROM `customers`;--> statement-breakpoint
DROP TABLE `customers`;--> statement-breakpoint
ALTER TABLE `__new_customers` RENAME TO `customers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "created_at") SELECT "id", "created_at" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text,
	`created_at` integer,
	`name` text,
	`customer_id` text,
	`created_by` text
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "created_at", "name", "customer_id", "created_by") SELECT "id", "created_at", "name", "customer_id", "created_by" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;