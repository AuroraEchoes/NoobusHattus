CREATE TABLE "houses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "houses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"season_id" integer NOT NULL,
	"house_name" varchar(64) NOT NULL,
	"house_emoji" varchar(16) NOT NULL,
	"house_role_id" bigint
);
--> statement-breakpoint
CREATE TABLE "log_channels" (
	"guild_id" bigint NOT NULL,
	"channel_id" bigint NOT NULL,
	CONSTRAINT "log_channels_guild_id_channel_id_pk" PRIMARY KEY("guild_id","channel_id"),
	CONSTRAINT "log_channels_guild_id_unique" UNIQUE("guild_id")
);
--> statement-breakpoint
CREATE TABLE "logged_messages" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"channel_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"message_id" bigint NOT NULL,
	CONSTRAINT "logged_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "permission_roles" (
	"permission" varchar(32) NOT NULL,
	"role_id" bigint NOT NULL,
	CONSTRAINT "permission_roles_permission_role_id_pk" PRIMARY KEY("permission","role_id")
);
--> statement-breakpoint
CREATE TABLE "point_actions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "point_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"target_id" integer NOT NULL,
	"source_user_id" bigint,
	"reason" varchar(128),
	"point_value" integer NOT NULL,
	"house_id" integer
);
--> statement-breakpoint
CREATE TABLE "processed_logs" (
	"log_id" bigint PRIMARY KEY NOT NULL,
	CONSTRAINT "processed_logs_log_id_unique" UNIQUE("log_id")
);
--> statement-breakpoint
CREATE TABLE "season_multipliers" (
	"season_id" integer PRIMARY KEY NOT NULL,
	"point_multiplier" real DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seasons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"season_name" varchar(64) NOT NULL,
	"guild_id" bigint NOT NULL,
	"is_active" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "summary_messages" (
	"channel_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"message_id" bigint NOT NULL,
	CONSTRAINT "summary_messages_guild_id_channel_id_pk" PRIMARY KEY("guild_id","channel_id"),
	CONSTRAINT "summary_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "user_houses" (
	"user_id" bigint NOT NULL,
	"season_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	CONSTRAINT "user_houses_user_id_season_id_pk" PRIMARY KEY("user_id","season_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"discord_id" bigint NOT NULL,
	"steam_id" bigint NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_messages" ADD CONSTRAINT "logged_messages_action_id_point_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."point_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_messages" ADD CONSTRAINT "logged_messages_guild_id_channel_id_log_channels_guild_id_channel_id_fk" FOREIGN KEY ("guild_id","channel_id") REFERENCES "public"."log_channels"("guild_id","channel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_actions" ADD CONSTRAINT "point_actions_target_id_users_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_actions" ADD CONSTRAINT "point_actions_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_actions" ADD CONSTRAINT "point_actions_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_multipliers" ADD CONSTRAINT "season_multipliers_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summary_messages" ADD CONSTRAINT "summary_messages_guild_id_channel_id_log_channels_guild_id_channel_id_fk" FOREIGN KEY ("guild_id","channel_id") REFERENCES "public"."log_channels"("guild_id","channel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_houses" ADD CONSTRAINT "user_houses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_houses" ADD CONSTRAINT "user_houses_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_houses" ADD CONSTRAINT "user_houses_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "single_active_season_per_guild" ON "seasons" USING btree ("guild_id") WHERE "seasons"."is_active" = true;