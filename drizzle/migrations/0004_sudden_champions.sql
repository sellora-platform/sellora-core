ALTER TABLE "users" ALTER COLUMN "is_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" varchar(50) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(50) DEFAULT 'trialing';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp;