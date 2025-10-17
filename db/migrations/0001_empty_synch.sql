PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`phone` text,
	`name` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_customers`("id", "created_at", "phone", "name", "created_by") SELECT "id", "created_at", "phone", "name", "created_by" FROM `customers`;--> statement-breakpoint
DROP TABLE `customers`;--> statement-breakpoint
ALTER TABLE `__new_customers` RENAME TO `customers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`customer_id` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "created_at", "name", "customer_id", "created_by") SELECT "id", "created_at", "name", "customer_id", "created_by" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;