PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "created_at") SELECT "id", "created_at" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;