CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`phone` text,
	`name` text NOT NULL,
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`customer_id` text NOT NULL,
	`created_by` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
