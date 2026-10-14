ALTER TABLE "contact_leads" ADD COLUMN "ubicacion" text;--> statement-breakpoint
ALTER TABLE "contact_leads" ADD COLUMN "email_enviado" boolean DEFAULT false NOT NULL;