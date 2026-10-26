CREATE TABLE "rate_limits" (
	"clave" text PRIMARY KEY NOT NULL,
	"cuenta" integer DEFAULT 1 NOT NULL,
	"vence_at" timestamp with time zone NOT NULL
);
