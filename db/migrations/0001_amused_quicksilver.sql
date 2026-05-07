ALTER TABLE "stores" ADD COLUMN "custom_domain" varchar(255);--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_custom_domain_unique" UNIQUE("custom_domain");