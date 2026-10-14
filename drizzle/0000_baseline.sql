CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"logo" text NOT NULL,
	"bio" text,
	"content" text,
	"featured" boolean DEFAULT true NOT NULL,
	"work_rank" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"logo_focal" text,
	"logo_focal_mobile" text,
	"tiene_blog" boolean DEFAULT false NOT NULL,
	CONSTRAINT "clientes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"empresa" text,
	"email" text NOT NULL,
	"phone" text,
	"servicio" text,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresas_agenda" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"contacto" text,
	"telefono" text,
	"notas" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"logo_url" text,
	"tipo" text DEFAULT 'particular' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos_agenda" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" date NOT NULL,
	"hora_inicio" time NOT NULL,
	"hora_fin" time,
	"grua_id" uuid,
	"empresa_id" uuid,
	"ubicacion" text,
	"notas" text,
	"estado" text DEFAULT 'programado' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_hasta" date
);
--> statement-breakpoint
CREATE TABLE "eventos_operarios" (
	"evento_id" uuid NOT NULL,
	"operario_id" uuid NOT NULL,
	CONSTRAINT "eventos_operarios_evento_id_operario_id_pk" PRIMARY KEY("evento_id","operario_id")
);
--> statement-breakpoint
CREATE TABLE "galeria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imagen" text NOT NULL,
	"alt" text NOT NULL,
	"col_span_mobile" smallint DEFAULT 1 NOT NULL,
	"row_span_mobile" smallint DEFAULT 1 NOT NULL,
	"col_span_desktop" smallint DEFAULT 1 NOT NULL,
	"row_span_desktop" smallint DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gruas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"patente" text,
	"capacidad_toneladas" numeric,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tipo" text DEFAULT 'Grúa' NOT NULL,
	"foto_url" text
);
--> statement-breakpoint
CREATE TABLE "montajes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text,
	"cover_image" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cover_image_focal" text,
	"banner_image" text,
	"banner_image_focal" text,
	"cover_image_focal_mobile" text,
	"banner_image_focal_mobile" text,
	CONSTRAINT "montajes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notificaciones_enviadas" (
	"clave" text PRIMARY KEY NOT NULL,
	"enviada_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"foto_url" text,
	"roles" text[] DEFAULT '{}'::text[] NOT NULL,
	"eliminado_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"plataforma" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "servicios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"specs" text[] DEFAULT '{}'::text[] NOT NULL,
	"img" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	CONSTRAINT "servicios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trabajos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"youtube_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha" date,
	"attachment_url" text,
	"cover_image_focal" text,
	"banner_image" text,
	"banner_image_focal" text,
	"cover_image_focal_mobile" text,
	"banner_image_focal_mobile" text,
	"banner_overlay_opacity" integer DEFAULT 100 NOT NULL,
	"banner_overlay_opacity_mobile" integer
);
--> statement-breakpoint
CREATE TABLE "tv_pairing_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tv_pairing_codes_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_agenda" ADD CONSTRAINT "eventos_agenda_grua_id_gruas_id_fk" FOREIGN KEY ("grua_id") REFERENCES "public"."gruas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_agenda" ADD CONSTRAINT "eventos_agenda_empresa_id_empresas_agenda_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas_agenda"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_operarios" ADD CONSTRAINT "eventos_operarios_evento_id_eventos_agenda_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos_agenda"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_operarios" ADD CONSTRAINT "eventos_operarios_operario_id_operarios_id_fk" FOREIGN KEY ("operario_id") REFERENCES "public"."operarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tv_pairing_codes" ADD CONSTRAINT "tv_pairing_codes_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "eventos_agenda_empresa_id_idx" ON "eventos_agenda" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "eventos_agenda_fecha_idx" ON "eventos_agenda" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "eventos_agenda_grua_id_idx" ON "eventos_agenda" USING btree ("grua_id");--> statement-breakpoint
CREATE INDEX "operarios_eliminado_at_idx" ON "operarios" USING btree ("eliminado_at");--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trabajos_cliente_id_slug_key" ON "trabajos" USING btree ("cliente_id","slug");--> statement-breakpoint
CREATE INDEX "trabajos_cliente_id_idx" ON "trabajos" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "tv_pairing_codes_token_idx" ON "tv_pairing_codes" USING btree ("token");