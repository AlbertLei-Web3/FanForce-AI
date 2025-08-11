DROP TABLE IF EXISTS "public"."admin_activity_log";
-- Table Definition
CREATE TABLE "public"."admin_activity_log" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "admin_id" uuid,
    "action_type" varchar(100) NOT NULL,
    "action_details" jsonb DEFAULT '{}'::jsonb,
    "affected_user_id" uuid,
    "ip_address" inet,
    "user_agent" text,
    "session_id" varchar(100),
    "success" bool DEFAULT true,
    "error_message" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_activity_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "admin_activity_log_affected_user_id_fkey" FOREIGN KEY ("affected_user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_admin_activity_log_admin_id ON public.admin_activity_log USING btree (admin_id);
CREATE INDEX idx_admin_activity_log_action_type ON public.admin_activity_log USING btree (action_type);

DROP TABLE IF EXISTS "public"."admin_dashboard_stats";
-- Table Definition
CREATE TABLE "public"."admin_dashboard_stats" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "stat_type" varchar(50) NOT NULL,
    "stat_value" numeric(18,8) NOT NULL,
    "stat_metadata" jsonb DEFAULT '{}'::jsonb,
    "period" varchar(20) DEFAULT 'daily'::character varying,
    "stat_date" date NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_admin_dashboard_stats_type ON public.admin_dashboard_stats USING btree (stat_type);
CREATE INDEX idx_admin_dashboard_stats_date ON public.admin_dashboard_stats USING btree (stat_date);

DROP VIEW IF EXISTS "public"."admin_stats_view";
 SELECT 'total_users'::text AS stat_name,
    (count(*))::numeric(18,8) AS stat_value,
    'count'::text AS stat_type,
    CURRENT_DATE AS stat_date
   FROM users
UNION ALL
 SELECT 'active_events'::text AS stat_name,
    (count(*))::numeric(18,8) AS stat_value,
    'count'::text AS stat_type,
    CURRENT_DATE AS stat_date
   FROM events
  WHERE ((events.status)::text = 'active'::text)
UNION ALL
 SELECT 'total_transactions'::text AS stat_name,
    (count(*))::numeric(18,8) AS stat_value,
    'count'::text AS stat_type,
    CURRENT_DATE AS stat_date
   FROM transactions
UNION ALL
 SELECT 'total_chz_staked'::text AS stat_name,
    COALESCE(sum(transactions.amount), (0)::numeric) AS stat_value,
    'amount'::text AS stat_type,
    CURRENT_DATE AS stat_date
   FROM transactions
  WHERE (((transactions.transaction_type)::text = 'stake'::text) AND ((transactions.status)::text = 'completed'::text));

DROP VIEW IF EXISTS "public"."ambassador_recent_events";
 SELECT e.id AS event_id,
    e.title AS event_title,
    e.description AS event_description,
    e.event_date,
    e.match_status,
    e.pool_injected_chz,
    e.total_pool_amount,
    e.match_result,
    ea.team_a_info,
    ea.team_b_info,
    ea.venue_name,
    ea.venue_capacity,
    u.wallet_address AS ambassador_wallet,
    count(ep.id) AS total_participants,
    count(assr.id) AS total_supporters
   FROM ((((events e
     LEFT JOIN event_applications ea ON ((e.application_id = ea.id)))
     LEFT JOIN users u ON ((e.ambassador_id = u.id)))
     LEFT JOIN event_participants ep ON ((e.id = ep.event_id)))
     LEFT JOIN audience_support_records assr ON ((e.id = assr.event_id)))
  WHERE ((e.match_status)::text = ANY ((ARRAY['pre_match'::character varying, 'active'::character varying, 'completed'::character varying])::text[]))
  GROUP BY e.id, e.title, e.description, e.event_date, e.match_status, e.pool_injected_chz, e.total_pool_amount, e.match_result, ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity, u.wallet_address;

DROP TABLE IF EXISTS "public"."analytics";
-- Table Definition
CREATE TABLE "public"."analytics" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "metric_type" varchar(50) NOT NULL,
    "metric_data" jsonb DEFAULT '{}'::jsonb,
    "metric_value" numeric(18,8) NOT NULL,
    "period" varchar(20) DEFAULT 'daily'::character varying,
    "analysis_date" date NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."athlete_season_progress";
-- Table Definition
CREATE TABLE "public"."athlete_season_progress" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "athlete_id" uuid NOT NULL,
    "season_year" int4 NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
    "season_quarter" int4 NOT NULL DEFAULT EXTRACT(quarter FROM CURRENT_DATE),
    "matches_played" int4 DEFAULT 0,
    "matches_won" int4 DEFAULT 0,
    "social_posts_count" int4 DEFAULT 0,
    "virtual_chz_earned" numeric(18,8) DEFAULT 0.0,
    "required_matches" int4 DEFAULT 5,
    "required_wins" int4 DEFAULT 3,
    "required_posts" int4 DEFAULT 10,
    "required_virtual_chz" numeric(18,8) DEFAULT 100.0,
    "is_eligible_for_vault" bool DEFAULT false,
    "vault_deposit_enabled" bool DEFAULT false,
    "season_completed" bool DEFAULT false,
    "progress_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "athlete_season_progress_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX athlete_season_progress_athlete_id_season_year_season_quart_key ON public.athlete_season_progress USING btree (athlete_id, season_year, season_quarter);
CREATE INDEX idx_athlete_season_progress_athlete_id ON public.athlete_season_progress USING btree (athlete_id);
CREATE INDEX idx_athlete_season_progress_eligible ON public.athlete_season_progress USING btree (is_eligible_for_vault);
CREATE INDEX idx_athlete_season_progress_season ON public.athlete_season_progress USING btree (season_year, season_quarter);

DROP VIEW IF EXISTS "public"."athlete_vault_status";
 SELECT u.id AS athlete_id,
    u.wallet_address,
    asp.season_year,
    asp.season_quarter,
    asp.is_eligible_for_vault,
    asp.vault_deposit_enabled,
    COALESCE(sum(vd.usdc_amount), (0)::numeric) AS total_deposited_usdc,
    COALESCE(sum(pd.athlete_share_usdc), (0)::numeric) AS total_earnings_usdc,
    count(vd.id) AS deposit_count,
    count(pd.id) AS distribution_count
   FROM (((users u
     LEFT JOIN athlete_season_progress asp ON ((u.id = asp.athlete_id)))
     LEFT JOIN vault_deposits vd ON (((u.id = vd.athlete_id) AND ((vd.status)::text = 'confirmed'::text))))
     LEFT JOIN profit_distributions pd ON (((u.id = pd.athlete_id) AND ((pd.status)::text = 'distributed'::text))))
  WHERE ((u.role)::text = 'athlete'::text)
  GROUP BY u.id, u.wallet_address, asp.season_year, asp.season_quarter, asp.is_eligible_for_vault, asp.vault_deposit_enabled;

DROP TABLE IF EXISTS "public"."athletes";
-- Table Definition
CREATE TABLE "public"."athletes" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid,
    "ranking" int4 DEFAULT 1000,
    "tier" varchar(20) DEFAULT 'bronze'::character varying,
    "status" varchar(20) DEFAULT 'resting'::character varying,
    "season_earnings" numeric(18,8) DEFAULT 0.0,
    "matches_played" int4 DEFAULT 0,
    "matches_won" int4 DEFAULT 0,
    "social_posts" int4 DEFAULT 0,
    "total_fees_earned" numeric(18,8) DEFAULT 0.0,
    "performance_stats" jsonb DEFAULT '{}'::jsonb,
    "availability_status" varchar(20) DEFAULT 'available'::character varying,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "matches_lost" int4 DEFAULT 0,
    "matches_drawn" int4 DEFAULT 0,
    "current_ranking" int4 DEFAULT 1000,
    "ranking_points" int4 DEFAULT 0,
    "last_match_date" date,
    "win_rate" numeric(5,2) DEFAULT 0.00,
    "total_goals_scored" int4 DEFAULT 0,
    "total_assists" int4 DEFAULT 0,
    "total_yellow_cards" int4 DEFAULT 0,
    "total_red_cards" int4 DEFAULT 0,
    CONSTRAINT "athletes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_athletes_ranking ON public.athletes USING btree (current_ranking);
CREATE INDEX idx_athletes_win_rate ON public.athletes USING btree (win_rate);

DROP TABLE IF EXISTS "public"."audience_stakes_extended";
-- Table Definition
CREATE TABLE "public"."audience_stakes_extended" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "event_id" uuid,
    "participation_id" uuid,
    "stake_amount" numeric(18,8) NOT NULL,
    "currency" varchar(10) DEFAULT 'CHZ'::character varying,
    "team_choice" varchar(10) NOT NULL,
    "base_reward_tier" int4 DEFAULT 1,
    "participation_bonus_tier" int4 DEFAULT 0,
    "final_reward_tier" int4,
    "base_multiplier" numeric(5,3) DEFAULT 0.30,
    "participation_multiplier" numeric(5,3) DEFAULT 0.00,
    "final_multiplier" numeric(5,3),
    "event_result" varchar(20),
    "is_winner" bool,
    "calculated_reward" numeric(18,8) DEFAULT 0.0,
    "actual_payout" numeric(18,8) DEFAULT 0.0,
    "stake_status" varchar(20) DEFAULT 'active'::character varying,
    "settlement_status" varchar(20) DEFAULT 'pending'::character varying,
    "stake_time" timestamp DEFAULT CURRENT_TIMESTAMP,
    "settlement_time" timestamp,
    "payout_time" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audience_stakes_extended_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "audience_stakes_extended_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "audience_stakes_extended_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "public"."event_participations"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_audience_stakes_extended_user ON public.audience_stakes_extended USING btree (user_id);
CREATE INDEX idx_audience_stakes_extended_event ON public.audience_stakes_extended USING btree (event_id);

DROP TABLE IF EXISTS "public"."audience_support_records";
-- Table Definition
CREATE TABLE "public"."audience_support_records" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "support_option_id" uuid NOT NULL,
    "support_amount" numeric(18,8) NOT NULL,
    "support_coefficient" numeric(5,3) NOT NULL,
    "support_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
    "potential_reward" numeric(18,8) DEFAULT 0.0,
    "actual_reward" numeric(18,8) DEFAULT 0.0,
    "reward_distributed" bool DEFAULT false,
    "reward_distribution_time" timestamp,
    "support_status" varchar(20) DEFAULT 'active'::character varying,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audience_support_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "audience_support_records_support_option_id_fkey" FOREIGN KEY ("support_option_id") REFERENCES "public"."support_options"("id"),
    CONSTRAINT "audience_support_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_audience_support_records_event ON public.audience_support_records USING btree (event_id);
CREATE INDEX idx_audience_support_records_user ON public.audience_support_records USING btree (user_id);

DROP TABLE IF EXISTS "public"."chz_pool_management";
-- Table Definition
CREATE TABLE "public"."chz_pool_management" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "operation_type" varchar(30) NOT NULL,
    "amount" numeric(18,8) NOT NULL,
    "performed_by" uuid NOT NULL,
    "operation_reason" text,
    "pool_balance_before" numeric(18,8) NOT NULL,
    "pool_balance_after" numeric(18,8) NOT NULL,
    "fee_rule_id" uuid,
    "fee_amount" numeric(18,8) DEFAULT 0.0,
    "transaction_hash" varchar(66),
    "transaction_status" varchar(20) DEFAULT 'pending'::character varying,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chz_pool_management_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "chz_pool_management_fee_rule_id_fkey" FOREIGN KEY ("fee_rule_id") REFERENCES "public"."fee_rules"("id"),
    CONSTRAINT "chz_pool_management_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_chz_pool_management_event ON public.chz_pool_management USING btree (event_id);
CREATE INDEX idx_chz_pool_management_operation ON public.chz_pool_management USING btree (operation_type);

DROP TABLE IF EXISTS "public"."chz_pool_monitor";
-- Table Definition
CREATE TABLE "public"."chz_pool_monitor" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "contract_address" varchar(42) NOT NULL,
    "total_staked_chz" numeric(18,8) DEFAULT 0.0,
    "total_fees_collected" numeric(18,8) DEFAULT 0.0,
    "available_for_withdrawal" numeric(18,8) DEFAULT 0.0,
    "total_rewards_distributed" numeric(18,8) DEFAULT 0.0,
    "pool_health_score" int4 DEFAULT 100,
    "last_contract_sync" timestamp,
    "monitoring_status" varchar(20) DEFAULT 'active'::character varying,
    "alert_threshold" numeric(18,8) DEFAULT 1000.0,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_chz_pool_monitor_contract ON public.chz_pool_monitor USING btree (contract_address);
CREATE INDEX idx_chz_pool_monitor_status ON public.chz_pool_monitor USING btree (monitoring_status);

DROP TABLE IF EXISTS "public"."event_applications";
-- Table Definition
CREATE TABLE "public"."event_applications" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "ambassador_id" uuid NOT NULL,
    "event_title" varchar(200) NOT NULL,
    "event_description" text,
    "event_start_time" timestamp NOT NULL,
    "event_end_time" timestamp,
    "qr_valid_from" timestamp,
    "qr_valid_until" timestamp,
    "venue_name" varchar(200) NOT NULL,
    "venue_address" text,
    "venue_capacity" int4 NOT NULL,
    "party_venue_capacity" int4 DEFAULT 0,
    "team_a_info" jsonb DEFAULT '{}'::jsonb,
    "team_b_info" jsonb DEFAULT '{}'::jsonb,
    "status" varchar(20) DEFAULT 'pending'::character varying,
    "priority_level" int4 DEFAULT 1,
    "admin_review" jsonb DEFAULT '{}'::jsonb,
    "reviewed_by" uuid,
    "reviewed_at" timestamp,
    "qr_code_generated" bool DEFAULT false,
    "qr_generation_time" timestamp,
    "estimated_participants" int4 DEFAULT 0,
    "expected_revenue" numeric(18,8) DEFAULT 0.0,
    "application_notes" text,
    "external_sponsors" jsonb DEFAULT '[]'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_applications_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "event_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_event_applications_ambassador ON public.event_applications USING btree (ambassador_id);
CREATE INDEX idx_event_applications_status ON public.event_applications USING btree (status);
CREATE INDEX idx_event_applications_start_time ON public.event_applications USING btree (event_start_time);
CREATE INDEX idx_event_applications_ambassador_id ON public.event_applications USING btree (ambassador_id);

DROP TABLE IF EXISTS "public"."event_approval_log";
-- Table Definition
CREATE TABLE "public"."event_approval_log" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" uuid NOT NULL,
    "event_id" uuid,
    "admin_id" uuid NOT NULL,
    "action_type" varchar(30) NOT NULL,
    "decision" varchar(20),
    "injected_chz_amount" numeric(18,8) DEFAULT 0.0,
    "fee_rule_applied" uuid,
    "support_options" jsonb DEFAULT '{}'::jsonb,
    "admin_notes" text,
    "approval_conditions" jsonb DEFAULT '{}'::jsonb,
    "action_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_approval_log_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "event_approval_log_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "event_approval_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "event_approval_log_fee_rule_applied_fkey" FOREIGN KEY ("fee_rule_applied") REFERENCES "public"."fee_rules"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_event_approval_log_application ON public.event_approval_log USING btree (application_id);
CREATE INDEX idx_event_approval_log_admin ON public.event_approval_log USING btree (admin_id);
CREATE INDEX idx_event_approval_log_action_type ON public.event_approval_log USING btree (action_type);

DROP TABLE IF EXISTS "public"."event_creation_log";
-- Table Definition
CREATE TABLE "public"."event_creation_log" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "event_id" uuid NOT NULL,
    "application_id" uuid NOT NULL,
    "ambassador_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_creation_log_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "event_creation_log_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "event_creation_log_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."event_participants";
-- Table Definition
CREATE TABLE "public"."event_participants" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "user_id" uuid,
    "participation_type" varchar(20) NOT NULL,
    "team_assignment" varchar(10),
    "tier" varchar(20) DEFAULT 'standard'::character varying,
    "stake_amount" numeric(18,8) DEFAULT 0.0,
    "status" varchar(20) DEFAULT 'registered'::character varying,
    "qr_checked_in" bool DEFAULT false,
    "check_in_time" timestamp,
    "reward_earned" numeric(18,8) DEFAULT 0.0,
    "participation_proof" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_event_participants_event_id ON public.event_participants USING btree (event_id);
CREATE INDEX idx_event_participants_user_id ON public.event_participants USING btree (user_id);

DROP TABLE IF EXISTS "public"."event_participations";
-- Table Definition
CREATE TABLE "public"."event_participations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "event_id" uuid,
    "application_id" uuid,
    "qr_code_id" uuid,
    "participation_type" varchar(30) NOT NULL,
    "reward_tier" int4 NOT NULL,
    "scan_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
    "scan_location" jsonb DEFAULT '{}'::jsonb,
    "user_agent" text,
    "ip_address" inet,
    "is_verified" bool DEFAULT true,
    "verification_method" varchar(20) DEFAULT 'qr_scan'::character varying,
    "party_allocation_status" varchar(20) DEFAULT 'pending'::character varying,
    "party_allocation_result" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "event_participations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "event_participations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "event_participations_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."event_qr_codes"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_event_participations_user ON public.event_participations USING btree (user_id);
CREATE INDEX idx_event_participations_event ON public.event_participations USING btree (event_id);

DROP TABLE IF EXISTS "public"."event_qr_codes";
-- Table Definition
CREATE TABLE "public"."event_qr_codes" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "application_id" uuid,
    "qr_content" text NOT NULL,
    "verification_code" varchar(50) NOT NULL,
    "valid_from" timestamp NOT NULL,
    "valid_until" timestamp NOT NULL,
    "is_active" bool DEFAULT true,
    "current_status" varchar(20) DEFAULT 'pending'::character varying,
    "scans_count" int4 DEFAULT 0,
    "successful_scans" int4 DEFAULT 0,
    "failed_scans" int4 DEFAULT 0,
    "last_scan_time" timestamp,
    "max_scans" int4 DEFAULT 1000,
    "rate_limit_per_user" int4 DEFAULT 5,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_qr_codes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "event_qr_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX event_qr_codes_verification_code_key ON public.event_qr_codes USING btree (verification_code);
CREATE INDEX idx_event_qr_codes_event ON public.event_qr_codes USING btree (event_id);
CREATE INDEX idx_event_qr_codes_verification ON public.event_qr_codes USING btree (verification_code);
CREATE INDEX idx_event_qr_codes_valid_time ON public.event_qr_codes USING btree (valid_from, valid_until);

DROP TABLE IF EXISTS "public"."events";
-- Table Definition
CREATE TABLE "public"."events" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "venue_id" uuid,
    "party_venue_id" uuid,
    "ambassador_id" uuid,
    "title" varchar(200) NOT NULL,
    "description" text,
    "event_date" timestamp NOT NULL,
    "registration_deadline" timestamp NOT NULL,
    "status" varchar(20) DEFAULT 'draft'::character varying,
    "entry_fee" numeric(18,8) DEFAULT 0.0,
    "stake_amount" numeric(18,8) DEFAULT 0.0,
    "max_participants" int4 DEFAULT 100,
    "current_participants" int4 DEFAULT 0,
    "weather_dependency" varchar(20) DEFAULT 'low'::character varying,
    "contingency_plans" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "application_id" uuid,
    "match_status" varchar(20) DEFAULT 'draft'::character varying,
    "pool_injected_chz" numeric(18,8) DEFAULT 0.0,
    "pool_injection_time" timestamp,
    "pool_injected_by" uuid,
    "fee_rule_id" uuid,
    "support_options" jsonb DEFAULT '{}'::jsonb,
    "match_result" varchar(20),
    "result_announced_at" timestamp,
    "total_pool_amount" numeric(18,8) DEFAULT 0.0,
    "total_stakes_amount" numeric(18,8) DEFAULT 0.0,
    "total_rewards_distributed" numeric(18,8) DEFAULT 0.0,
    "sport_type" varchar(50),
    "start_time" time,
    "end_time" time,
    "venue_name" varchar(255),
    "venue_address" text,
    "venue_capacity" int4,
    "party_venue_capacity" int4,
    "team_a_info" jsonb,
    "team_b_info" jsonb,
    "estimated_participants" int4,
    "expected_revenue" numeric(10,2),
    "team_a_score" int4,
    "team_b_score" int4,
    "result_announced_by" uuid,
    "match_completed_at" timestamp,
    "total_participants" int4 DEFAULT 0,
    "rewards_distributed" bool DEFAULT false,
    "rewards_distributed_at" timestamp,
    CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id"),
    CONSTRAINT "events_party_venue_id_fkey" FOREIGN KEY ("party_venue_id") REFERENCES "public"."venues"("id"),
    CONSTRAINT "events_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "events_result_announced_by_fkey" FOREIGN KEY ("result_announced_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "events_pool_injected_by_fkey" FOREIGN KEY ("pool_injected_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "events_fee_rule_id_fkey" FOREIGN KEY ("fee_rule_id") REFERENCES "public"."fee_rules"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_events_status ON public.events USING btree (status);
CREATE INDEX idx_events_date ON public.events USING btree (event_date);
CREATE INDEX idx_events_application_id ON public.events USING btree (application_id);
CREATE INDEX idx_events_match_status ON public.events USING btree (match_status);
CREATE INDEX idx_events_pool_injected_by ON public.events USING btree (pool_injected_by);
CREATE INDEX idx_events_match_result ON public.events USING btree (match_result);
CREATE INDEX idx_events_result_announced_at ON public.events USING btree (result_announced_at);

DROP TABLE IF EXISTS "public"."fee_rules";
-- Table Definition
CREATE TABLE "public"."fee_rules" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "rule_name" varchar(100) NOT NULL,
    "staking_fee_percent" numeric(5,2) DEFAULT 5.00,
    "withdrawal_fee_percent" numeric(5,2) DEFAULT 2.00,
    "distribution_fee_percent" numeric(5,2) DEFAULT 3.00,
    "ambassador_share_percent" numeric(5,2) DEFAULT 1.00,
    "athlete_share_percent" numeric(5,2) DEFAULT 1.00,
    "community_fund_percent" numeric(5,2) DEFAULT 1.00,
    "is_active" bool DEFAULT true,
    "effective_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fee_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_fee_rules_active ON public.fee_rules USING btree (is_active);

DROP TABLE IF EXISTS "public"."invite_codes";
-- Table Definition
CREATE TABLE "public"."invite_codes" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "ambassador_id" uuid,
    "event_id" uuid,
    "code" varchar(20) NOT NULL,
    "usage_limit" int4 DEFAULT 100,
    "usage_count" int4 DEFAULT 0,
    "expires_at" timestamp NOT NULL,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invite_codes_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "invite_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX invite_codes_code_key ON public.invite_codes USING btree (code);

DROP TABLE IF EXISTS "public"."match_result_announcements";
-- Table Definition
CREATE TABLE "public"."match_result_announcements" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "announced_by" uuid NOT NULL,
    "team_a_score" int4 NOT NULL,
    "team_b_score" int4 NOT NULL,
    "match_result" varchar(20) NOT NULL,
    "announcement_notes" text,
    "weather_conditions" text,
    "special_events" text,
    "is_verified" bool DEFAULT false,
    "verified_by" uuid,
    "verified_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "match_result_announcements_announced_by_fkey" FOREIGN KEY ("announced_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "match_result_announcements_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "match_result_announcements_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."match_result_announcements"."match_result" IS 'Overall match result (team_a_wins, team_b_wins, draw, cancelled)';


-- Comments
COMMENT ON TABLE "public"."match_result_announcements" IS 'Tracks all match result announcements for audit and verification purposes';


-- Indices
CREATE INDEX idx_match_result_announcements_event ON public.match_result_announcements USING btree (event_id);
CREATE INDEX idx_match_result_announcements_announced_by ON public.match_result_announcements USING btree (announced_by);

DROP TABLE IF EXISTS "public"."match_results";
-- Table Definition
CREATE TABLE "public"."match_results" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "athlete_id" uuid NOT NULL,
    "team_assignment" varchar(10) NOT NULL,
    "match_result" varchar(20) NOT NULL,
    "performance_score" int4 DEFAULT 0,
    "ranking_points_earned" int4 DEFAULT 0,
    "ranking_points_lost" int4 DEFAULT 0,
    "goals_scored" int4 DEFAULT 0,
    "assists" int4 DEFAULT 0,
    "yellow_cards" int4 DEFAULT 0,
    "red_cards" int4 DEFAULT 0,
    "is_verified" bool DEFAULT false,
    "verified_by" uuid,
    "verified_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "match_results_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id"),
    CONSTRAINT "match_results_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "match_results_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."match_results"."team_assignment" IS 'Which team the athlete was assigned to (team_a or team_b)';
COMMENT ON COLUMN "public"."match_results"."match_result" IS 'Individual result for this athlete (win, loss, draw)';


-- Comments
COMMENT ON TABLE "public"."match_results" IS 'Stores detailed match results for individual athletes with performance metrics';


-- Indices
CREATE UNIQUE INDEX match_results_event_id_athlete_id_key ON public.match_results USING btree (event_id, athlete_id);
CREATE INDEX idx_match_results_event ON public.match_results USING btree (event_id);
CREATE INDEX idx_match_results_athlete ON public.match_results USING btree (athlete_id);
CREATE INDEX idx_match_results_result ON public.match_results USING btree (match_result);

DROP TABLE IF EXISTS "public"."match_status_transitions";
-- Table Definition
CREATE TABLE "public"."match_status_transitions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "from_status" varchar(20) NOT NULL,
    "to_status" varchar(20) NOT NULL,
    "transition_reason" text,
    "triggered_by" uuid,
    "trigger_type" varchar(30),
    "context_data" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "match_status_transitions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "match_status_transitions_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_match_status_transitions_event ON public.match_status_transitions USING btree (event_id);
CREATE INDEX idx_match_status_transitions_status ON public.match_status_transitions USING btree (to_status);

DROP TABLE IF EXISTS "public"."party_allocations";
-- Table Definition
CREATE TABLE "public"."party_allocations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "application_id" uuid,
    "total_capacity" int4 NOT NULL,
    "allocated_spots" int4 DEFAULT 0,
    "waitlist_count" int4 DEFAULT 0,
    "allocation_method" varchar(20) DEFAULT 'first_come'::character varying,
    "allocation_start_time" timestamp,
    "allocation_end_time" timestamp,
    "allocation_status" varchar(20) DEFAULT 'pending'::character varying,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "party_allocations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."event_applications"("id"),
    CONSTRAINT "party_allocations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."platform_fee_config";
-- Table Definition
CREATE TABLE "public"."platform_fee_config" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "fee_percentage" numeric(5,3) NOT NULL DEFAULT 5.0,
    "is_active" bool DEFAULT true,
    "description" text,
    "updated_by" uuid,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_fee_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."platform_fee_config"."fee_percentage" IS 'Platform fee percentage (0-100) for reward calculations';


-- Comments
COMMENT ON TABLE "public"."platform_fee_config" IS 'Stores platform fee configuration for reward calculations';


-- Indices
CREATE INDEX idx_platform_fee_config_active ON public.platform_fee_config USING btree (is_active);

DROP TABLE IF EXISTS "public"."profit_distributions";
-- Table Definition
CREATE TABLE "public"."profit_distributions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "athlete_id" uuid NOT NULL,
    "vault_deposit_id" uuid,
    "total_profit_usdc" numeric(18,6) NOT NULL,
    "athlete_share_usdc" numeric(18,6) NOT NULL,
    "foundation_share_usdc" numeric(18,6) NOT NULL,
    "distribution_period_start" timestamp NOT NULL,
    "distribution_period_end" timestamp NOT NULL,
    "distribution_timestamp" timestamp NOT NULL,
    "trading_pairs" jsonb DEFAULT '[]'::jsonb,
    "total_trades" int4 DEFAULT 0,
    "average_roi" numeric(8,4) DEFAULT 0.0,
    "status" varchar(20) DEFAULT 'calculated'::character varying,
    "blockchain_hash" varchar(66),
    "distribution_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profit_distributions_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "profit_distributions_vault_deposit_id_fkey" FOREIGN KEY ("vault_deposit_id") REFERENCES "public"."vault_deposits"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_profit_distributions_athlete_id ON public.profit_distributions USING btree (athlete_id);
CREATE INDEX idx_profit_distributions_status ON public.profit_distributions USING btree (status);
CREATE INDEX idx_profit_distributions_period ON public.profit_distributions USING btree (distribution_period_start, distribution_period_end);
CREATE INDEX idx_profit_distributions_timestamp ON public.profit_distributions USING btree (distribution_timestamp);

DROP TABLE IF EXISTS "public"."qr_codes";
-- Table Definition
CREATE TABLE "public"."qr_codes" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "code_type" varchar(20) NOT NULL,
    "qr_data" text NOT NULL,
    "jwt_token" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "is_active" bool DEFAULT true,
    "usage_count" int4 DEFAULT 0,
    "max_usage" int4 DEFAULT 1000,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_qr_codes_event_id ON public.qr_codes USING btree (event_id);

DROP TABLE IF EXISTS "public"."qr_scan_logs";
-- Table Definition
CREATE TABLE "public"."qr_scan_logs" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "qr_code_id" uuid,
    "user_id" uuid,
    "scan_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
    "scan_result" varchar(20) NOT NULL,
    "error_message" text,
    "user_agent" text,
    "ip_address" inet,
    "geolocation" jsonb DEFAULT '{}'::jsonb,
    "device_info" jsonb DEFAULT '{}'::jsonb,
    "is_suspicious" bool DEFAULT false,
    "fraud_score" int4 DEFAULT 0,
    "rate_limit_triggered" bool DEFAULT false,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_scan_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."event_qr_codes"("id"),
    CONSTRAINT "qr_scan_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_qr_scan_logs_qr_code ON public.qr_scan_logs USING btree (qr_code_id);
CREATE INDEX idx_qr_scan_logs_timestamp ON public.qr_scan_logs USING btree (scan_timestamp);

DROP TABLE IF EXISTS "public"."qr_scans";
-- Table Definition
CREATE TABLE "public"."qr_scans" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "qr_code_id" uuid,
    "user_id" uuid,
    "event_id" uuid,
    "scan_type" varchar(20) NOT NULL,
    "scan_result" varchar(20) NOT NULL,
    "scan_metadata" jsonb DEFAULT '{}'::jsonb,
    "scanned_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_scans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "qr_scans_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id"),
    CONSTRAINT "qr_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_qr_scans_event_id ON public.qr_scans USING btree (event_id);

DROP TABLE IF EXISTS "public"."reward_calculations";
-- Table Definition
CREATE TABLE "public"."reward_calculations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "stake_record_id" uuid NOT NULL,
    "admin_pool_amount" numeric(18,8) NOT NULL,
    "total_participants" int4 NOT NULL,
    "user_tier_coefficient" numeric(5,3) NOT NULL,
    "calculated_reward" numeric(18,8) NOT NULL,
    "platform_fee_percentage" numeric(5,3) NOT NULL DEFAULT 5.0,
    "platform_fee_amount" numeric(18,8) NOT NULL,
    "final_reward" numeric(18,8) NOT NULL,
    "calculation_time" timestamp DEFAULT CURRENT_TIMESTAMP,
    "calculation_status" varchar(20) DEFAULT 'calculated'::character varying,
    "payment_status" varchar(20) DEFAULT 'pending'::character varying,
    "payment_time" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_calculations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "reward_calculations_stake_record_id_fkey" FOREIGN KEY ("stake_record_id") REFERENCES "public"."user_stake_records"("id"),
    CONSTRAINT "reward_calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."reward_calculations"."user_tier_coefficient" IS 'Reward multiplier based on participation tier (1.0, 0.7, 0.3)';


-- Comments
COMMENT ON TABLE "public"."reward_calculations" IS 'Stores calculated rewards for user stakes with platform fee deductions';


-- Indices
CREATE UNIQUE INDEX idx_reward_calculations_stake_record ON public.reward_calculations USING btree (stake_record_id);
CREATE INDEX idx_reward_calculations_event_id ON public.reward_calculations USING btree (event_id);
CREATE INDEX idx_reward_calculations_user_id ON public.reward_calculations USING btree (user_id);
CREATE INDEX idx_reward_calculations_stake_record_id ON public.reward_calculations USING btree (stake_record_id);
CREATE INDEX idx_reward_calculations_calculation_time ON public.reward_calculations USING btree (calculation_time);

DROP TABLE IF EXISTS "public"."reward_distributions";
-- Table Definition
CREATE TABLE "public"."reward_distributions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "stake_record_id" uuid,
    "original_stake_amount" numeric(18,8) NOT NULL,
    "admin_pool_amount" numeric(18,8) NOT NULL,
    "total_participants" int4 NOT NULL,
    "user_tier_coefficient" numeric(5,3) NOT NULL,
    "base_reward" numeric(18,8) NOT NULL,
    "platform_fee_percentage" numeric(5,3) NOT NULL DEFAULT 5.0,
    "platform_fee_amount" numeric(18,8) NOT NULL,
    "final_reward" numeric(18,8) NOT NULL,
    "distribution_status" varchar(20) DEFAULT 'calculated'::character varying,
    "distributed_at" timestamp,
    "transaction_hash" varchar(66),
    "calculation_formula" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_distributions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "reward_distributions_stake_record_id_fkey" FOREIGN KEY ("stake_record_id") REFERENCES "public"."user_stake_records"("id"),
    CONSTRAINT "reward_distributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."reward_distributions"."calculation_formula" IS 'Human-readable formula showing how the reward was calculated';


-- Comments
COMMENT ON TABLE "public"."reward_distributions" IS 'Stores calculated rewards for all participants with detailed calculation formulas';


-- Indices
CREATE INDEX idx_reward_distributions_event ON public.reward_distributions USING btree (event_id);
CREATE INDEX idx_reward_distributions_user ON public.reward_distributions USING btree (user_id);
CREATE INDEX idx_reward_distributions_status ON public.reward_distributions USING btree (distribution_status);

DROP TABLE IF EXISTS "public"."rewards";
-- Table Definition
CREATE TABLE "public"."rewards" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid,
    "user_id" uuid,
    "reward_type" varchar(20) NOT NULL,
    "base_amount" numeric(18,8) NOT NULL,
    "multiplier" numeric(4,2) DEFAULT 1.0,
    "final_amount" numeric(18,8) NOT NULL,
    "tier" varchar(20) DEFAULT 'standard'::character varying,
    "status" varchar(20) DEFAULT 'calculated'::character varying,
    "distribution_method" varchar(20) DEFAULT 'contract'::character varying,
    "reward_metadata" jsonb DEFAULT '{}'::jsonb,
    "distributed_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."rule_engine_logs";
-- Table Definition
CREATE TABLE "public"."rule_engine_logs" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "log_type" varchar(50) NOT NULL,
    "market_data_source" varchar(50) DEFAULT 'okx_dex'::character varying,
    "analyzed_tokens" jsonb DEFAULT '[]'::jsonb,
    "market_conditions" jsonb DEFAULT '{}'::jsonb,
    "strategy_name" varchar(100),
    "strategy_parameters" jsonb DEFAULT '{}'::jsonb,
    "decision_reason" text,
    "trade_pairs" jsonb DEFAULT '[]'::jsonb,
    "trade_amounts" jsonb DEFAULT '[]'::jsonb,
    "trade_prices" jsonb DEFAULT '[]'::jsonb,
    "trade_timestamps" jsonb DEFAULT '[]'::jsonb,
    "execution_success" bool DEFAULT true,
    "profit_loss" numeric(18,6) DEFAULT 0.0,
    "gas_used" numeric(18,6) DEFAULT 0.0,
    "error_message" text,
    "error_details" jsonb DEFAULT '{}'::jsonb,
    "execution_duration_ms" int4 DEFAULT 0,
    "blockchain_hash" varchar(66),
    "log_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_rule_engine_logs_type ON public.rule_engine_logs USING btree (log_type);
CREATE INDEX idx_rule_engine_logs_success ON public.rule_engine_logs USING btree (execution_success);
CREATE INDEX idx_rule_engine_logs_created ON public.rule_engine_logs USING btree (created_at);

DROP VIEW IF EXISTS "public"."rule_engine_performance";
 SELECT date(created_at) AS execution_date,
    log_type,
    count(*) AS execution_count,
    avg(execution_duration_ms) AS avg_duration_ms,
    sum(
        CASE
            WHEN execution_success THEN 1
            ELSE 0
        END) AS success_count,
    sum(
        CASE
            WHEN (NOT execution_success) THEN 1
            ELSE 0
        END) AS failure_count,
    sum(profit_loss) AS total_profit_loss,
    avg(profit_loss) AS avg_profit_loss
   FROM rule_engine_logs
  GROUP BY (date(created_at)), log_type
  ORDER BY (date(created_at)) DESC, log_type;

DROP TABLE IF EXISTS "public"."support_options";
-- Table Definition
CREATE TABLE "public"."support_options" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "option_name" varchar(100) NOT NULL,
    "option_description" text,
    "coefficient" numeric(5,3) NOT NULL,
    "max_supporters" int4 DEFAULT 0,
    "current_supporters" int4 DEFAULT 0,
    "team_association" varchar(10),
    "is_active" bool DEFAULT true,
    "is_featured" bool DEFAULT false,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_options_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_support_options_event ON public.support_options USING btree (event_id);
CREATE INDEX idx_support_options_active ON public.support_options USING btree (is_active);

DROP TABLE IF EXISTS "public"."system_config";
-- Table Definition
CREATE TABLE "public"."system_config" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "config_key" varchar(100) NOT NULL,
    "config_value" jsonb NOT NULL,
    "description" text,
    "is_active" bool DEFAULT true,
    "created_by" uuid,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_config_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX system_config_config_key_key ON public.system_config USING btree (config_key);
CREATE INDEX idx_system_config_key ON public.system_config USING btree (config_key);
CREATE INDEX idx_system_config_active ON public.system_config USING btree (is_active);

DROP TABLE IF EXISTS "public"."team_drafts";
-- Table Definition
CREATE TABLE "public"."team_drafts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "ambassador_id" uuid,
    "draft_name" varchar(200) NOT NULL,
    "sport_type" varchar(50) DEFAULT 'soccer'::character varying,
    "team_a_name" varchar(200) NOT NULL,
    "team_a_athletes" jsonb DEFAULT '[]'::jsonb,
    "team_a_metadata" jsonb DEFAULT '{}'::jsonb,
    "team_b_name" varchar(200) NOT NULL,
    "team_b_athletes" jsonb DEFAULT '[]'::jsonb,
    "team_b_metadata" jsonb DEFAULT '{}'::jsonb,
    "status" varchar(20) DEFAULT 'draft'::character varying,
    "estimated_duration" int4 DEFAULT 90,
    "match_notes" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_drafts_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_team_drafts_ambassador_id ON public.team_drafts USING btree (ambassador_id);
CREATE INDEX idx_team_drafts_status ON public.team_drafts USING btree (status);

DROP TABLE IF EXISTS "public"."transactions";
-- Table Definition
CREATE TABLE "public"."transactions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid,
    "event_id" uuid,
    "transaction_type" varchar(20) NOT NULL,
    "amount" numeric(18,8) NOT NULL,
    "fee_amount" numeric(18,8) DEFAULT 0.0,
    "currency" varchar(10) DEFAULT 'CHZ'::character varying,
    "status" varchar(20) DEFAULT 'pending'::character varying,
    "blockchain_hash" varchar(66),
    "payment_method" varchar(20) DEFAULT 'contract'::character varying,
    "transaction_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "transactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);
CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);

DROP TABLE IF EXISTS "public"."user_management_log";
-- Table Definition
CREATE TABLE "public"."user_management_log" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid,
    "action_type" varchar(50) NOT NULL,
    "action_details" jsonb DEFAULT '{}'::jsonb,
    "admin_id" uuid,
    "auto_approved" bool DEFAULT true,
    "reason" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_management_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "user_management_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_user_management_log_user_id ON public.user_management_log USING btree (user_id);
CREATE INDEX idx_user_management_log_action_type ON public.user_management_log USING btree (action_type);

DROP TABLE IF EXISTS "public"."user_registration_queue";
-- Table Definition
CREATE TABLE "public"."user_registration_queue" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "wallet_address" varchar(42) NOT NULL,
    "requested_role" varchar(20) NOT NULL,
    "student_id" varchar(50),
    "profile_data" jsonb DEFAULT '{}'::jsonb,
    "registration_status" varchar(20) DEFAULT 'pending'::character varying,
    "auto_approved" bool DEFAULT true,
    "reviewed_by" uuid,
    "reviewed_at" timestamp,
    "rejection_reason" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_registration_queue_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX user_registration_queue_wallet_address_key ON public.user_registration_queue USING btree (wallet_address);
CREATE INDEX idx_user_registration_queue_status ON public.user_registration_queue USING btree (registration_status);
CREATE INDEX idx_user_registration_queue_wallet ON public.user_registration_queue USING btree (wallet_address);

DROP TABLE IF EXISTS "public"."user_stake_records";
-- Table Definition
CREATE TABLE "public"."user_stake_records" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "event_id" uuid NOT NULL,
    "stake_amount" numeric(18,8) NOT NULL,
    "currency" varchar(10) DEFAULT 'CHZ'::character varying,
    "participation_tier" int4 NOT NULL,
    "team_choice" varchar(10) NOT NULL,
    "status" varchar(20) DEFAULT 'active'::character varying,
    "stake_time" timestamp DEFAULT CURRENT_TIMESTAMP,
    "settlement_time" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_stake_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id"),
    CONSTRAINT "user_stake_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Column Comments
COMMENT ON COLUMN "public"."user_stake_records"."participation_tier" IS '1=Full Experience, 2=Stake+Match, 3=Stake Only';
COMMENT ON COLUMN "public"."user_stake_records"."team_choice" IS 'team_a or team_b selection';


-- Comments
COMMENT ON TABLE "public"."user_stake_records" IS 'Stores user staking records with tier-based participation levels';


-- Indices
CREATE UNIQUE INDEX idx_user_stake_records_user_event ON public.user_stake_records USING btree (user_id, event_id);
CREATE INDEX idx_user_stake_records_user_id ON public.user_stake_records USING btree (user_id);
CREATE INDEX idx_user_stake_records_event_id ON public.user_stake_records USING btree (event_id);
CREATE INDEX idx_user_stake_records_status ON public.user_stake_records USING btree (status);
CREATE INDEX idx_user_stake_records_stake_time ON public.user_stake_records USING btree (stake_time);

DROP TABLE IF EXISTS "public"."users";
-- Table Definition
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "wallet_address" varchar(42),
    "role" varchar(20) NOT NULL,
    "student_id" varchar(50),
    "profile_data" jsonb DEFAULT '{}'::jsonb,
    "virtual_chz_balance" numeric(18,8) DEFAULT 0.0,
    "real_chz_balance" numeric(18,8) DEFAULT 0.0,
    "reliability_score" int4 DEFAULT 100,
    "emergency_contact" varchar(200),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "icp_principal_id" varchar(100),
    "auth_type" varchar(20) DEFAULT 'wallet'::character varying,
    "ethereum_address" varchar(42),
    "secondary_roles" jsonb DEFAULT '[]'::jsonb,
    "role_preferences" jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX users_wallet_address_key ON public.users USING btree (wallet_address);
CREATE INDEX idx_users_wallet_address ON public.users USING btree (wallet_address);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE UNIQUE INDEX idx_users_icp_principal_id ON public.users USING btree (icp_principal_id);
CREATE INDEX idx_users_secondary_roles ON public.users USING gin (secondary_roles);

DROP TABLE IF EXISTS "public"."vault_deposits";
-- Table Definition
CREATE TABLE "public"."vault_deposits" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "athlete_id" uuid NOT NULL,
    "season_progress_id" uuid,
    "usdc_amount" numeric(18,6) NOT NULL,
    "deposit_timestamp" timestamp NOT NULL,
    "blockchain_hash" varchar(66),
    "status" varchar(20) DEFAULT 'pending'::character varying,
    "vault_contract_address" varchar(42),
    "shares_received" numeric(18,8) DEFAULT 0.0,
    "deposit_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vault_deposits_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "vault_deposits_season_progress_id_fkey" FOREIGN KEY ("season_progress_id") REFERENCES "public"."athlete_season_progress"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE INDEX idx_vault_deposits_athlete_id ON public.vault_deposits USING btree (athlete_id);
CREATE INDEX idx_vault_deposits_status ON public.vault_deposits USING btree (status);
CREATE INDEX idx_vault_deposits_timestamp ON public.vault_deposits USING btree (deposit_timestamp);
CREATE INDEX idx_vault_deposits_hash ON public.vault_deposits USING btree (blockchain_hash);

DROP TABLE IF EXISTS "public"."venues";
-- Table Definition
CREATE TABLE "public"."venues" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(200) NOT NULL,
    "address" text NOT NULL,
    "capacity" int4 NOT NULL,
    "available_capacity" int4 NOT NULL,
    "facilities" jsonb DEFAULT '{}'::jsonb,
    "status" varchar(20) DEFAULT 'active'::character varying,
    "emergency_info" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."admin_activity_log" ("id", "admin_id", "action_type", "action_details", "affected_user_id", "ip_address", "user_agent", "session_id", "success", "error_message", "created_at") VALUES
('0f34a2c4-a10c-4cb4-b941-27d0fceaf41f', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'event_application_created', '{"venue_name": "University Sports Center", "event_title": "Test Campus Basketball Match", "application_id": "1a566485-d6c3-47f5-b3c1-fbe7f961b676", "event_start_time": "2025-07-13T02:28:09.785Z", "estimated_participants": 150}', '1de6110a-f982-4f7f-979e-00e7f7d33bed', NULL, NULL, NULL, 't', NULL, '2025-07-11 10:28:10.285935'),
('0ed53414-cb2e-44ed-ade9-9e68694f8e50', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-18T08:46:20.115Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-18 16:46:20.116275'),
('b12b5f14-93b4-460d-9cae-8783adbde8da', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-18T08:51:46.581Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-18 16:51:46.582569'),
('84025089-7d03-4edb-9600-97d4150729ba', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-18T08:52:40.958Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-18 16:52:40.959459'),
('3077158d-c465-4c45-8ec9-9b63c18ba4e1', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-18T09:07:41.912Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-18 17:07:41.913261'),
('1d25f3e6-5bd0-49a5-bfc4-88480f9ef6f1', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-20T01:15:09.729Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-20 09:15:09.730901'),
('6a01502d-591d-4985-afa2-59db4e45f851', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-20T03:45:34.639Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-20 11:45:34.640193'),
('7f3ba8b9-59e7-4dca-8ed6-e32c3d46f724', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-20T04:08:07.253Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-20 12:08:07.254183'),
('888642dc-ca51-4a29-a3c5-406631baedc9', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-21T03:08:58.764Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-21 11:08:58.765505'),
('e027fc33-c72c-44de-b687-bc0a35732f8a', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-21T07:18:59.042Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-21 15:18:59.042653'),
('d2b842ce-67eb-4f9f-801f-52c3e715e790', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-21T07:31:43.161Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-21 15:31:43.161948'),
('8bb0bdca-eb6a-436f-8c65-aa85e248e746', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T01:55:39.107Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 09:55:39.108682'),
('99fcc069-7149-4368-8c41-c4022f04ea8d', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T02:15:31.654Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 10:15:31.654681'),
('a9862871-08ad-4434-86d4-bd0ca84ed9c3', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T02:19:51.789Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 10:19:51.789802'),
('43162e77-f199-40c8-a720-63938678733e', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T02:33:41.470Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 10:33:41.471442'),
('808bd7f3-1825-4a63-97fe-0ddbca7d56bd', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T03:18:00.960Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 11:18:00.961447'),
('739d5c70-6d05-453d-b73c-a6b72e9cd807', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-22T03:20:18.340Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-22 11:20:18.340995'),
('b9738761-d567-4fe3-b22c-9e1421adc561', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-23T01:09:26.184Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-23 09:09:26.185941'),
('148cad51-ab0d-46f1-971b-bc8a320d1cb6', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-23T01:33:48.577Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-23 09:33:48.578751'),
('c0a07510-16d0-4cf8-a776-2533488de78e', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-23T03:02:41.478Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-23 11:02:41.479297'),
('636d3be1-237c-4863-9041-b01f7698fcac', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'dashboard_access', '{"timestamp": "2025-07-23T09:21:10.299Z"}', NULL, NULL, NULL, NULL, 't', NULL, '2025-07-23 17:21:10.299679');
INSERT INTO "public"."admin_dashboard_stats" ("id", "stat_type", "stat_value", "stat_metadata", "period", "stat_date", "created_at", "updated_at") VALUES
('9fe80a8a-a456-480e-a881-b91ec508c8fb', 'total_users', 7.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('5b1a71e1-11af-4dc7-a101-4ac588fe9864', 'active_users', 7.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('68a2c431-a74d-420b-92a9-0f719d29f0f0', 'total_events', 0.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('e6a75d50-f870-46df-bdc9-f48c866dbf7d', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('b9109a1a-1326-4424-845f-a5aa3aae56d8', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('fc94820c-128f-4771-a3c4-1c2a1b1fb214', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-11', '2025-07-11 09:43:17.879552', '2025-07-11 09:43:17.879552'),
('5c5f09b3-5ae2-4e83-9166-b84728cd43dd', 'total_users', 15.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('667729e9-cc83-402b-b073-15cd86eddaa7', 'active_users', 15.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('6b7dcf6e-6736-4264-ba4c-53272d31aabe', 'total_events', 24.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('261e8834-1aa1-4218-bf07-86441fc055ce', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('d8d47116-4f09-4687-a747-c5f69c888863', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('387afd01-4abc-4a75-9bc7-5c8d97c03a10', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-22', '2025-07-22 11:20:18.354195', '2025-07-22 11:20:18.354195'),
('76c3e673-2c3c-492a-8e95-8aa86cab3412', 'total_users', 15.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('5e20f5a5-07c2-4e68-aa63-4ad52bab3bde', 'active_users', 15.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('edde8043-f12c-4359-9933-c2ea1fe53b27', 'total_events', 12.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('1771e8c7-e8a7-46e3-a337-95cab727079d', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('dd6f915f-93dc-4fe0-904d-4d02a20e5838', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('9ab0706e-b1b7-4e83-b6ae-0e46d1da7643', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-18', '2025-07-18 17:07:41.925993', '2025-07-18 17:07:41.925993'),
('7d99f886-8398-4297-a68b-a3d65c0476e8', 'total_users', 15.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('286e454d-ca10-4f8c-aa1a-265028b616b3', 'active_users', 15.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('c2724637-4b48-42d6-a149-2c1eb5c08322', 'total_events', 15.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('303ee0b8-4b21-47f5-a62d-f76e71ebf5a9', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('cc20c1e5-39ba-4e0e-92ff-7cb204f018bb', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('36be8685-62c9-4724-b569-40029549b9df', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-20', '2025-07-20 12:08:07.266879', '2025-07-20 12:08:07.266879'),
('d1c1c74d-6634-4329-aa7f-4e01746ea797', 'total_users', 15.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('ac1d26e0-9787-42a8-9a48-2ad8e2a981d9', 'active_users', 15.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('22ffb71c-3df3-4e31-b405-2038f66c5ed5', 'total_events', 28.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('3e80ba01-4ce7-434f-95bc-9b5d170c8944', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('7b7570c2-d575-4798-826e-d57ec861a363', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('f0fcaa3f-6ce3-48e0-b555-d83c6146764e', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-23', '2025-07-23 17:21:10.313866', '2025-07-23 17:21:10.313866'),
('d4d99dde-4204-438d-90c8-62961ab8e777', 'total_users', 15.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314'),
('b87d094e-527b-45ac-8532-e7842cd236b5', 'active_users', 15.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314'),
('f5cad48c-dd1d-4003-87a8-e66eb686f976', 'total_events', 18.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314'),
('5127191d-2337-4a61-b29f-5b05582c5ceb', 'total_staked', 0.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314'),
('79a7f511-022d-4b16-b2f9-09448f1fd2ab', 'platform_fees', 0.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314'),
('153d14a5-f8fd-4233-b946-0a1d833f6105', 'chz_pool_health', 100.00000000, '{}', 'real_time', '2025-07-21', '2025-07-21 15:31:43.175314', '2025-07-21 15:31:43.175314');





INSERT INTO "public"."athletes" ("id", "user_id", "ranking", "tier", "status", "season_earnings", "matches_played", "matches_won", "social_posts", "total_fees_earned", "performance_stats", "availability_status", "created_at", "updated_at", "matches_lost", "matches_drawn", "current_ranking", "ranking_points", "last_match_date", "win_rate", "total_goals_scored", "total_assists", "total_yellow_cards", "total_red_cards") VALUES
('c9b0d1bb-ab93-4932-8efa-f54ed9613fa1', '85c75c8c-7540-40ac-aae9-a4042aa87d59', 1000, 'bronze', 'active', 0.00000000, 0, 0, 0, 0.00000000, '{"goals": 0, "assists": 0, "win_rate": 0, "red_cards": 0, "yellow_cards": 0, "matches_played": 0}', 'available', '2025-07-17 14:31:52.633952', '2025-07-17 14:31:52.633952', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('1ff302ac-8fdf-4d08-a8ae-967de14d0315', '9bfc59fa-1c0e-4f39-b45f-1d063432b22c', 1000, 'bronze', 'active', 0.00000000, 25, 18, 0, 0.00000000, '{"goals": 15, "assists": 8, "win_rate": 0.72, "red_cards": 0, "yellow_cards": 2, "matches_played": 25}', 'available', '2025-07-17 14:33:31.923808', '2025-07-17 14:33:31.923808', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('059fa45c-db9e-41c1-b870-67425fa51ff1', '58ebca77-3ce5-46f5-a00b-f797cd383c32', 1000, 'bronze', 'active', 0.00000000, 28, 19, 0, 0.00000000, '{"goals": 12, "assists": 15, "win_rate": 0.68, "red_cards": 0, "yellow_cards": 1, "matches_played": 28}', 'available', '2025-07-17 14:33:31.930326', '2025-07-17 14:33:31.930326', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('c669adb0-e67d-4355-94c6-be33aa44c7d9', 'ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b', 1000, 'bronze', 'active', 0.00000000, 22, 16, 0, 0.00000000, '{"goals": 18, "assists": 6, "win_rate": 0.75, "red_cards": 0, "yellow_cards": 3, "matches_played": 22}', 'available', '2025-07-17 14:33:31.93539', '2025-07-17 14:33:31.93539', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('3b03a152-3c83-46d7-b2d7-e4a51285fd09', '4603a95a-2df0-4553-88c6-0cf76095d1e0', 1000, 'bronze', 'active', 0.00000000, 26, 16, 0, 0.00000000, '{"goals": 10, "assists": 12, "win_rate": 0.65, "red_cards": 0, "yellow_cards": 1, "matches_played": 26}', 'available', '2025-07-17 14:33:31.940334', '2025-07-17 14:33:31.940334', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('9b574452-7cfc-460c-8dff-25ebda59a0c2', '3b7a6d4f-ceba-4ee5-a394-852446e1d851', 1000, 'bronze', 'active', 0.00000000, 24, 16, 0, 0.00000000, '{"goals": 14, "assists": 9, "win_rate": 0.7, "red_cards": 0, "yellow_cards": 2, "matches_played": 24}', 'available', '2025-07-17 14:33:31.946908', '2025-07-17 14:33:31.946908', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('df45a6a4-5336-480e-a61f-23c618bb7730', '164d9ef9-5d0d-449c-aecf-7d91b43863e6', 1000, 'bronze', 'active', 0.00000000, 23, 16, 0, 0.00000000, '{"goals": 16, "assists": 7, "win_rate": 0.73, "red_cards": 0, "yellow_cards": 1, "matches_played": 23}', 'available', '2025-07-17 14:33:31.951928', '2025-07-17 14:33:31.951928', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('00b71e0d-900a-4b27-bae8-02a74b14ff1f', 'd7c65b4e-1211-48bd-be9a-c85447e0f905', 1000, 'bronze', 'active', 0.00000000, 20, 13, 0, 0.00000000, '{"points": 22.5, "assists": 4.8, "rebounds": 8.2, "win_rate": 0.65, "matches_played": 20, "field_goal_percentage": 0.48}', 'available', '2025-07-17 14:33:31.956653', '2025-07-17 14:33:31.956653', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0),
('6a50e418-e433-4c4f-94ee-adf2a91c2c7e', '683aacc7-d397-4608-aed9-cc7391906b4e', 1000, 'bronze', 'active', 0.00000000, 18, 12, 0, 0.00000000, '{"points": 19.8, "assists": 6.2, "rebounds": 6.5, "win_rate": 0.72, "matches_played": 18, "field_goal_percentage": 0.52}', 'available', '2025-07-17 14:33:31.96087', '2025-07-17 14:33:31.96087', 0, 0, 1000, 0, NULL, 0.00, 0, 0, 0, 0);


INSERT INTO "public"."chz_pool_management" ("id", "event_id", "operation_type", "amount", "performed_by", "operation_reason", "pool_balance_before", "pool_balance_after", "fee_rule_id", "fee_amount", "transaction_hash", "transaction_status", "created_at", "updated_at") VALUES
('4a140125-d95a-4fe4-9b5e-4a993d1a4d41', '80f87acc-91c7-4a44-b802-a5f8f7c662aa', 'injection', 1000.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1000.00000000, '4809565a-9c3c-490f-96f9-35b969aa3049', 0.00000000, NULL, 'completed', '2025-07-18 11:15:29.153399', '2025-07-18 11:15:29.153399'),
('2cf90d1c-f13f-46f4-80fc-ed862a3f75d2', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', 'injection', 1000.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1000.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 15:39:50.226285', '2025-07-18 15:39:50.226285'),
('b983869e-50a8-4336-825b-98fcbb674248', '7ed276d2-3627-4ca0-91aa-7d2b720c5645', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 15:54:13.167133', '2025-07-18 15:54:13.167133'),
('516e3ee0-b53a-42af-ba75-b436bb83839a', '9ef9b97b-73ef-4e12-8ea3-eedf98c1354a', 'injection', 100.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 100.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:25:49.6776', '2025-07-18 16:25:49.6776'),
('62d673e7-3408-43ea-b2e2-fa1f2aec7253', 'ec003340-a440-45ff-bdff-39d9b19d4387', 'injection', 750.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 750.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:29:11.170879', '2025-07-18 16:29:11.170879'),
('27d510d0-43fb-46d0-a7c9-e172e234651e', '508d43c2-d744-4b15-b0d5-ee237f641b09', 'injection', 850.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 850.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:35:33.668727', '2025-07-18 16:35:33.668727'),
('d1550daf-235c-4dd7-9ccf-ab379fb650f2', 'b42349bb-bfcc-4288-adc1-c78b0a9c7ecd', 'injection', 750.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 750.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:45:01.876026', '2025-07-18 16:45:01.876026'),
('935fa8d0-f923-4d58-9a48-a6d6846c3800', '577b60cd-8479-4588-a4ef-777022d2f80c', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:46:17.286288', '2025-07-18 16:46:17.286288'),
('cde2e1a8-9ad3-4cd3-a6d6-c06e0668c9e2', '9b5ae883-e01d-4db4-953d-69fdb73f1c50', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:51:43.210641', '2025-07-18 16:51:43.210641'),
('a6603d69-500b-483f-b572-73db30d53297', '9340f85d-69f0-4945-a6cf-47cff80349fd', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:52:16.224954', '2025-07-18 16:52:16.224954'),
('2f851337-57c5-4d34-b394-6423a24c001d', '230ce2ca-3957-455f-b131-8337caeade66', 'injection', 750.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 750.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 16:56:30.340774', '2025-07-18 16:56:30.340774'),
('6b6b1811-baf8-4237-a9b7-4527ba7e3f65', '65439fc4-77fd-4b58-973f-c95a915e8075', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-18 17:07:41.185317', '2025-07-18 17:07:41.185317'),
('a326693a-d3e1-4400-8cdc-8ac0b3b06d8c', 'ac793df8-7dd8-4aae-943e-de10fcafadc0', 'injection', 1000.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1000.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-20 09:15:09.052756', '2025-07-20 09:15:09.052756'),
('01995756-45d4-4cc6-9aa1-3a4b5448110a', '9b33b55c-c09e-41b9-b031-1c8680dd636a', 'injection', 1500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-20 11:45:33.597835', '2025-07-20 11:45:33.597835'),
('8ae07995-0e82-4bb3-9905-fd0baabbdff0', 'b4c539e8-9632-44ff-a5af-7fad9708503f', 'injection', 500.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 500.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-20 12:08:06.832104', '2025-07-20 12:08:06.832104'),
('aae93903-3c43-46e6-b5c8-7cf53fc7cedc', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', 'injection', 521.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 521.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-21 11:08:58.316034', '2025-07-21 11:08:58.316034'),
('74ffa57a-275b-4d51-8b32-bc3f338aae40', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', 'injection', 1000.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1000.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-21 15:18:58.476091', '2025-07-21 15:18:58.476091'),
('cad9c707-331a-4a11-967c-7735257488d1', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', 'injection', 300.01000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 300.01000000, NULL, 0.00000000, NULL, 'completed', '2025-07-21 15:31:42.666146', '2025-07-21 15:31:42.666146'),
('8f5c1bfb-e764-465a-88fa-7fde39204e34', '91461b54-60ef-4498-bb89-6253910d068b', 'injection', 531.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 531.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 09:55:38.618229', '2025-07-22 09:55:38.618229'),
('2bd38107-0750-416e-b2c3-7df237a6366d', 'adad592a-7bff-49b7-9987-cf4c8df7b650', 'injection', 1999.99000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 1999.99000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 10:15:31.083777', '2025-07-22 10:15:31.083777'),
('b2c0afb5-9a0f-4c59-848f-5ce9ca1e02d2', '5830a693-615f-43ed-a942-cf5a511def4b', 'injection', 2000.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 2000.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 10:19:51.418956', '2025-07-22 10:19:51.418956'),
('cc715ea0-abea-46d5-bcd9-9696dc9906c2', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 'injection', 600.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 600.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 10:33:40.92984', '2025-07-22 10:33:40.92984'),
('36609083-4ad6-426b-b0f1-046799e6dc45', '25a747ed-e75a-4e91-be83-915946d07fe3', 'injection', 700.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 700.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 11:18:00.325192', '2025-07-22 11:18:00.325192'),
('538c1ec2-a45c-4547-bd2d-7433926f7fac', 'b98c8740-6cef-40a9-a8a3-76998361cc3d', 'injection', 760.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 760.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-22 11:20:17.722068', '2025-07-22 11:20:17.722068'),
('6f695e1c-88a7-4011-9f5f-d3cca1c561f5', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 'injection', 530.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 530.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-23 09:09:25.683548', '2025-07-23 09:09:25.683548'),
('5be5fe0a-3d27-464a-a30e-2dab5837318d', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 'injection', 600.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 600.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-23 09:33:48.06223', '2025-07-23 09:33:48.06223'),
('c8448eba-5dbf-4eda-a481-a8afb9e72de9', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 'injection', 700.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 700.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-23 11:02:40.96244', '2025-07-23 11:02:40.96244'),
('e6c3dd8e-a8fa-4700-8dcc-0010dce8846c', '432cbb23-a339-48c6-8418-055b2e2d72c0', 'injection', 600.00000000, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'Admin pool injection for event approval', 0.00000000, 600.00000000, NULL, 0.00000000, NULL, 'completed', '2025-07-23 17:21:09.70899', '2025-07-23 17:21:09.70899');
INSERT INTO "public"."chz_pool_monitor" ("id", "contract_address", "total_staked_chz", "total_fees_collected", "available_for_withdrawal", "total_rewards_distributed", "pool_health_score", "last_contract_sync", "monitoring_status", "alert_threshold", "metadata", "created_at", "updated_at") VALUES
('bbf34f77-0470-4487-a0f3-f53426ccbba6', '0x0000000000000000000000000000000000000000', 0.00000000, 0.00000000, 0.00000000, 0.00000000, 100, '2025-07-16 11:56:51.739631', 'active', 1000.00000000, '{"last_health_check": "2025-07-16T03:56:51.738Z", "transaction_counts": {"stakes": 0, "payouts": 0, "pending": 0}}', '2025-07-11 09:40:42.756992', '2025-07-16 11:56:51.739631');
INSERT INTO "public"."event_applications" ("id", "ambassador_id", "event_title", "event_description", "event_start_time", "event_end_time", "qr_valid_from", "qr_valid_until", "venue_name", "venue_address", "venue_capacity", "party_venue_capacity", "team_a_info", "team_b_info", "status", "priority_level", "admin_review", "reviewed_by", "reviewed_at", "qr_code_generated", "qr_generation_time", "estimated_participants", "expected_revenue", "application_notes", "external_sponsors", "created_at", "updated_at") VALUES
('c08a5689-9ea5-47b1-85ca-a13b1604c0b6', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder W vs Lightning H', 'soccer match between Thunder W and Lightning H', '2025-07-25 11:31:00', '2025-07-25 15:31:00', '2025-07-25 08:31:00', '2025-07-25 12:31:00', 'Venue1', 'Venue-address-1', 100, 0, '{"name": "Thunder W", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning H", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 500}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-18 16:52:16.224954', 'f', NULL, 90, 100.00000000, 'test1', '[]', '2025-07-18 11:33:22.723834', '2025-07-18 16:52:16.224954'),
('1a566485-d6c3-47f5-b3c1-fbe7f961b676', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Campus Basketball Match', 'A test basketball match between Engineering and Business departments', '2025-07-13 02:28:09.785', '2025-07-13 04:28:09.787', '2025-07-12 23:28:09.785', '2025-07-13 03:28:09.785', 'University Sports Center', '123 Campus Drive, University Town', 200, 50, '{"name": "Engineering Eagles", "captain": "John Doe", "players": ["John Doe", "Jane Smith", "Bob Johnson"]}', '{"name": "Business Bears", "captain": "Mike Wilson", "players": ["Mike Wilson", "Sarah Davis", "Tom Brown"]}', 'approved', 1, '{"decision": "approved", "admin_notes": "Test Toast notification", "team_a_coefficient": 1.3, "team_b_coefficient": 1.1, "injected_chz_amount": 750}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-18 16:56:30.340774', 'f', NULL, 150, 0.00000000, 'This is a test application for Phase 2 API testing', '[{"name": "Campus Store", "contribution": 500}, {"name": "Local Pizza", "contribution": 300}]', '2025-07-11 10:28:10.275835', '2025-07-18 16:56:30.340774'),
('8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c', '1de6110a-f982-4f7f-979e-00e7f7d33bed', ' Wolves vs Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-25 09:14:00', '2025-07-26 09:14:00', '2025-07-25 06:14:00', '2025-07-25 10:14:00', 'venue2', 'venue21', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 1000}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-20 09:15:09.052756', 'f', NULL, 90, 0.00000000, 'noting', '[]', '2025-07-20 09:14:50.797283', '2025-07-20 09:15:09.052756'),
('7b8efdfe-4d1e-4bdb-8719-d55c5b50a577', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'lves vs Light', 'soccer match', '2025-07-21 11:44:00', '2025-07-21 13:44:00', '2025-07-21 08:44:00', '2025-07-21 12:44:00', 'V3', 'V3A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "good", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 1500}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-20 11:45:33.597835', 'f', NULL, 90, 100.00000000, 'noting to say', '[]', '2025-07-20 11:45:09.265936', '2025-07-20 11:45:33.597835'),
('78715345-0dfe-46eb-90d1-a5baba0f8d7b', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder  vs Hawks', 'soccer match between Thunder  and Hawks', '2025-07-21 15:20:00', '2025-07-21 16:18:00', '2025-07-21 12:20:00', '2025-07-21 16:20:00', 'VT1', 'VT1A', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 1000}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-21 15:18:58.476091', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-21 15:18:28.948887', '2025-07-21 15:18:58.476091'),
('0f3009a6-a665-4b06-bd9c-5158913886ed', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Sample Campus Basketball Game', 'A sample basketball game for testing Phase 2 functionality', '2025-07-25 18:00:00', NULL, '2025-07-25 15:00:00', '2025-07-25 19:00:00', 'University Sports Center', '123 Campus Drive, University Town', 200, 50, '{"name": "Engineering Eagles", "captain": "John Doe", "players": ["John Doe", "Jane Smith"]}', '{"name": "Business Bears", "captain": "Mike Johnson", "players": ["Mike Johnson", "Sarah Wilson"]}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 500}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-18 17:07:41.185317', 'f', NULL, 150, 0.00000000, 'This is a test event application for Phase 2 development and testing.', '[]', '2025-07-11 10:05:49.264303', '2025-07-20 12:05:06.034141'),
('b47c81da-35a2-4c8f-a187-b4b28f9a631f', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'es vs Hawks', 'soccer match between T', '2025-07-20 17:07:00', '2025-07-20 17:11:00', '2025-07-20 14:07:00', '2025-07-20 18:07:00', 'V4', 'V4a', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "1", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 500}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-20 12:08:06.832104', 'f', NULL, 90, 100.00000000, 'nod', '[]', '2025-07-20 12:07:49.206557', '2025-07-20 12:08:06.832104'),
('307980bb-03da-45d9-8525-4f415351bfd5', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'olves vs Lightn', 'soccer match between ', '2025-07-21 12:08:00', '2025-07-21 13:08:00', '2025-07-21 09:08:00', '2025-07-21 13:08:00', 'V21', 'V21A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 521}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-21 11:08:58.316034', 'f', NULL, 90, 12.00000000, '', '[]', '2025-07-21 11:08:38.805595', '2025-07-21 11:08:58.316034'),
('16c99005-d00d-49c8-8311-fd70ba122aca', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder2  vs Hawks2', 'soccer match between Thunder  and Hawks', '2025-07-21 15:33:00', '2025-07-21 16:31:00', '2025-07-21 12:33:00', '2025-07-21 16:33:00', 'v', 'v2', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 300.01}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-21 15:31:42.666146', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-21 15:31:26.843947', '2025-07-21 15:31:42.666146'),
('191566bf-61c2-4c85-8015-d95dc3897542', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T1', 'soccer match between Thunder  and Hawks', '2025-07-22 10:54:00', '2025-07-22 10:56:00', '2025-07-22 07:54:00', '2025-07-22 11:54:00', '燃烧', '阿松大', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 531}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 09:55:38.618229', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 09:55:22.708183', '2025-07-22 09:55:38.618229'),
('a3d6a825-087e-41d1-81f2-33b38cb8efff', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T2', 'soccer match between Thunder  and Hawks', '2025-07-22 10:16:00', '2025-07-22 10:18:00', '2025-07-22 07:16:00', '2025-07-22 11:16:00', 'T2', 'T2', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 1999.99}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 10:15:31.083777', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 10:15:05.772179', '2025-07-22 10:15:31.083777'),
('b767c3ca-4822-41f4-a709-82a4804d2ed1', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T3', 'soccer match between Thunder  and Hawks', '2025-07-22 11:21:00', '2025-07-22 11:26:00', '2025-07-22 08:21:00', '2025-07-22 12:21:00', 'T3', 'T3', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 2000}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 10:19:51.418956', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 10:19:34.262049', '2025-07-22 10:19:51.418956'),
('cc010f2e-a25b-4402-892e-faa4d40504c9', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T5', 'soccer match between Thunder  and Hawks', '2025-07-22 10:53:00', '2025-07-22 11:03:00', '2025-07-22 07:53:00', '2025-07-22 11:53:00', 'T5', 'T5', 100, 0, '{"name": "Thunder ", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 600}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 10:33:40.92984', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 10:33:26.488053', '2025-07-22 10:33:40.92984'),
('5918b3b7-b17c-4aa5-9b1f-b11c00b38b48', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder Wolves6 vs Lightning Hawks6', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-22 11:18:00', '2025-07-22 13:17:00', '2025-07-22 08:18:00', '2025-07-22 12:18:00', 'T6', '……', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "6666", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 700}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 11:18:00.325192', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 11:17:40.834562', '2025-07-22 11:18:00.325192'),
('25a02569-8a1a-4995-adf4-fa77d9079c5b', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder Wolves7 vs Lightning Hawks7', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-22 11:20:00', '2025-07-22 12:19:00', '2025-07-22 08:20:00', '2025-07-22 12:20:00', '飒飒的', '阿松大', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 760}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-22 11:20:17.722068', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-22 11:20:01.43225', '2025-07-22 11:20:17.722068'),
('e02c5b7a-440b-4269-b40b-2deb96c67a12', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S8Thunder Wolves vs S8Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 09:10:00', '2025-07-23 10:08:00', '2025-07-23 06:10:00', '2025-07-23 10:10:00', 'S8', 'S8A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 530}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-23 09:09:25.683548', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-23 09:09:05.318026', '2025-07-23 09:09:25.683548'),
('d547c78b-338c-4fb2-b5e5-76a4f9f4d2ac', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S9Thunder Wolves vs S9Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 09:35:00', '2025-07-23 10:33:00', '2025-07-23 06:35:00', '2025-07-23 10:35:00', 'S9', 'S9A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 600}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-23 09:33:48.06223', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-23 09:33:33.499529', '2025-07-23 09:33:48.06223'),
('0fc237e7-2e6e-4f4c-8b3b-b16db7ec27b9', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S10Thunder Wolves vs S10Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 11:03:00', '2025-07-23 12:01:00', '2025-07-23 08:03:00', '2025-07-23 12:03:00', 'S10', 'S10A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 700}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-23 11:02:40.96244', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-23 11:01:35.817192', '2025-07-23 11:02:40.96244'),
('a2dc82a1-fd8b-4278-a652-db70c341c7c7', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S11Thunder Wolves vs S11Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 17:22:00', '2025-07-23 18:20:00', '2025-07-23 14:22:00', '2025-07-23 18:22:00', 'V1', 'V1A', 100, 0, '{"name": "Thunder Wolves", "athletes": ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"], "metadata": {}}', '{"name": "Lightning Hawks", "athletes": ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"], "metadata": {}}', 'approved', 1, '{"decision": "approved", "admin_notes": "", "team_a_coefficient": 1, "team_b_coefficient": 1, "injected_chz_amount": 600}', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '2025-07-23 17:21:09.70899', 'f', NULL, 90, 0.00000000, '', '[]', '2025-07-23 17:19:36.166307', '2025-07-23 17:21:09.70899');
INSERT INTO "public"."event_approval_log" ("id", "application_id", "event_id", "admin_id", "action_type", "decision", "injected_chz_amount", "fee_rule_applied", "support_options", "admin_notes", "approval_conditions", "action_timestamp", "created_at") VALUES
('d1724ac9-6cfd-4635-8471-b866cedbf4e4', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 1000.00000000, NULL, '{"team_a_coefficient": 1.5, "team_b_coefficient": 1}', 'Test approval with CHZ injection and support options', '{}', '2025-07-18 15:39:50.226285', '2025-07-18 15:39:50.226285'),
('9f2ce307-ca97-48bf-9686-3a033f56a087', '0f3009a6-a665-4b06-bd9c-5158913886ed', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1.2, "team_b_coefficient": 1}', 'Final system test approval', '{}', '2025-07-18 15:54:13.167133', '2025-07-18 15:54:13.167133'),
('6f3142e1-3801-45d1-9eab-3c37a64bf914', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 100.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'test', '{}', '2025-07-18 16:25:49.6776', '2025-07-18 16:25:49.6776'),
('eed74805-a509-461f-bae1-4d5ea71de8bb', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 750.00000000, NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', 'Test API fix', '{}', '2025-07-18 16:29:11.170879', '2025-07-18 16:29:11.170879'),
('a55b22c0-5b81-4b6a-a8e0-e927d4507b47', '0f3009a6-a665-4b06-bd9c-5158913886ed', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 850.00000000, NULL, '{"team_a_coefficient": 1.4, "team_b_coefficient": 1.2}', 'Complete approval flow test from frontend', '{}', '2025-07-18 16:35:33.668727', '2025-07-18 16:35:33.668727'),
('cad9647c-fb68-4f8b-a8cc-122e4e08863d', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 750.00000000, NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', 'Test UUID validation', '{}', '2025-07-18 16:45:01.876026', '2025-07-18 16:45:01.876026'),
('3d83eb80-20df-4bbd-a6ff-a5e3863f4917', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-18 16:46:17.286288', '2025-07-18 16:46:17.286288'),
('43b35a77-4834-45e4-83b9-469a3c1f0247', '0f3009a6-a665-4b06-bd9c-5158913886ed', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-18 16:51:43.210641', '2025-07-18 16:51:43.210641'),
('53023662-4506-474c-9bf5-322d73897e89', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-18 16:52:16.224954', '2025-07-18 16:52:16.224954'),
('5d056841-d172-486c-8dca-71acd19caa92', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 750.00000000, NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', 'Test Toast notification', '{}', '2025-07-18 16:56:30.340774', '2025-07-18 16:56:30.340774'),
('3503630e-43b9-4b36-8659-3a8b760562f9', '0f3009a6-a665-4b06-bd9c-5158913886ed', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-18 17:07:41.185317', '2025-07-18 17:07:41.185317'),
('bfa8c6e9-16b9-4c60-bfba-03303f98ff7b', '8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 1000.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-20 09:15:09.052756', '2025-07-20 09:15:09.052756'),
('363e346c-7f2b-42e5-89f6-66c3e4e52add', '7b8efdfe-4d1e-4bdb-8719-d55c5b50a577', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 1500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'good', '{}', '2025-07-20 11:45:33.597835', '2025-07-20 11:45:33.597835'),
('fa8fdd1f-f1b1-47b8-b7c8-957d1794c727', 'b47c81da-35a2-4c8f-a187-b4b28f9a631f', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 500.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '1', '{}', '2025-07-20 12:08:06.832104', '2025-07-20 12:08:06.832104'),
('5a2dcd9d-ea7f-46ea-af26-89a1ff4848a0', '307980bb-03da-45d9-8525-4f415351bfd5', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 521.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-21 11:08:58.316034', '2025-07-21 11:08:58.316034'),
('bee6dc06-ae53-4a33-b631-92c7e886b2a8', '78715345-0dfe-46eb-90d1-a5baba0f8d7b', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 1000.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-21 15:18:58.476091', '2025-07-21 15:18:58.476091'),
('657c0d41-357e-4b0e-84cf-dcd0f406c6f5', '16c99005-d00d-49c8-8311-fd70ba122aca', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 300.01000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-21 15:31:42.666146', '2025-07-21 15:31:42.666146'),
('48dfe193-3e3d-4e50-b00c-7bacd8214f9e', '191566bf-61c2-4c85-8015-d95dc3897542', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 531.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-22 09:55:38.618229', '2025-07-22 09:55:38.618229'),
('f298f3bd-371b-4590-a088-9ddd035debd8', 'a3d6a825-087e-41d1-81f2-33b38cb8efff', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 1999.99000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-22 10:15:31.083777', '2025-07-22 10:15:31.083777'),
('66737fae-4279-4030-b0b6-6a98d404d84a', 'b767c3ca-4822-41f4-a709-82a4804d2ed1', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 2000.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-22 10:19:51.418956', '2025-07-22 10:19:51.418956'),
('25a331b9-329d-425d-b313-fdf29b474960', 'cc010f2e-a25b-4402-892e-faa4d40504c9', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 600.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-22 10:33:40.92984', '2025-07-22 10:33:40.92984'),
('a49343ad-16c0-42d1-83fa-f4e694b70a54', '5918b3b7-b17c-4aa5-9b1f-b11c00b38b48', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 700.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '6666', '{}', '2025-07-22 11:18:00.325192', '2025-07-22 11:18:00.325192'),
('6de1c735-81bc-433d-964a-2f20c63acb43', '25a02569-8a1a-4995-adf4-fa77d9079c5b', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 760.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-22 11:20:17.722068', '2025-07-22 11:20:17.722068'),
('46997f1a-2423-4dc3-97ef-caaf1bd71a30', 'e02c5b7a-440b-4269-b40b-2deb96c67a12', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 530.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-23 09:09:25.683548', '2025-07-23 09:09:25.683548'),
('f7480ae5-a2fb-4408-a6bb-90d86f7e19ff', 'd547c78b-338c-4fb2-b5e5-76a4f9f4d2ac', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 600.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-23 09:33:48.06223', '2025-07-23 09:33:48.06223'),
('af14c97a-9954-497a-9feb-0b3ade2c18b3', '0fc237e7-2e6e-4f4c-8b3b-b16db7ec27b9', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 700.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-23 11:02:40.96244', '2025-07-23 11:02:40.96244'),
('117ebe8c-8050-4514-a1e8-50176f1f6604', 'a2dc82a1-fd8b-4278-a652-db70c341c7c7', NULL, 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', 'approve', 'approved', 600.00000000, NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', '', '{}', '2025-07-23 17:21:09.70899', '2025-07-23 17:21:09.70899');




INSERT INTO "public"."events" ("id", "venue_id", "party_venue_id", "ambassador_id", "title", "description", "event_date", "registration_deadline", "status", "entry_fee", "stake_amount", "max_participants", "current_participants", "weather_dependency", "contingency_plans", "created_at", "updated_at", "application_id", "match_status", "pool_injected_chz", "pool_injection_time", "pool_injected_by", "fee_rule_id", "support_options", "match_result", "result_announced_at", "total_pool_amount", "total_stakes_amount", "total_rewards_distributed", "sport_type", "start_time", "end_time", "venue_name", "venue_address", "venue_capacity", "party_venue_capacity", "team_a_info", "team_b_info", "estimated_participants", "expected_revenue", "team_a_score", "team_b_score", "result_announced_by", "match_completed_at", "total_participants", "rewards_distributed", "rewards_distributed_at") VALUES
('05d525b3-38bc-42f1-8a45-f7d16d0a46c5', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder W vs Lightning H', 'soccer match between Thunder W and Lightning H', '2025-07-25 11:31:00', '2025-07-25 10:31:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 15:39:50.226285', '2025-07-21 10:55:58.732912', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', 'pre_match', 1000.00000000, '2025-07-18 15:39:50.226285', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.5, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-21 10:55:58.732912', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1, NULL, NULL, 0, 'f', NULL),
('7ed276d2-3627-4ca0-91aa-7d2b720c5645', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Sample Campus Basketball Game', 'A sample basketball game for testing Phase 2 functionality', '2025-07-20 18:00:00', '2025-07-20 17:00:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 15:54:13.167133', '2025-07-18 15:54:13.167133', '0f3009a6-a665-4b06-bd9c-5158913886ed', 'pre_match', 500.00000000, '2025-07-18 15:54:13.167133', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.2, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('9ef9b97b-73ef-4e12-8ea3-eedf98c1354a', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder W vs Lightning H', 'soccer match between Thunder W and Lightning H', '2025-07-25 11:31:00', '2025-07-25 10:31:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:25:49.6776', '2025-07-18 16:25:49.6776', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', 'pre_match', 100.00000000, '2025-07-18 16:25:49.6776', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('ec003340-a440-45ff-bdff-39d9b19d4387', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Campus Basketball Match', 'A test basketball match between Engineering and Business departments', '2025-07-13 02:28:09.785', '2025-07-13 01:28:09.785', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:29:11.170879', '2025-07-18 16:29:11.170879', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', 'pre_match', 750.00000000, '2025-07-18 16:29:11.170879', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('508d43c2-d744-4b15-b0d5-ee237f641b09', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Sample Campus Basketball Game', 'A sample basketball game for testing Phase 2 functionality', '2025-07-20 18:00:00', '2025-07-20 17:00:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:35:33.668727', '2025-07-18 16:35:33.668727', '0f3009a6-a665-4b06-bd9c-5158913886ed', 'pre_match', 850.00000000, '2025-07-18 16:35:33.668727', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.4, "team_b_coefficient": 1.2}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('b42349bb-bfcc-4288-adc1-c78b0a9c7ecd', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Campus Basketball Match', 'A test basketball match between Engineering and Business departments', '2025-07-13 02:28:09.785', '2025-07-13 01:28:09.785', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:45:01.876026', '2025-07-18 16:45:01.876026', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', 'pre_match', 750.00000000, '2025-07-18 16:45:01.876026', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('577b60cd-8479-4588-a4ef-777022d2f80c', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder W vs Lightning H', 'soccer match between Thunder W and Lightning H', '2025-07-25 11:31:00', '2025-07-25 10:31:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:46:17.286288', '2025-07-18 16:46:17.286288', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', 'pre_match', 500.00000000, '2025-07-18 16:46:17.286288', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('b4c539e8-9632-44ff-a5af-7fad9708503f', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'es vs Hawks', 'soccer match between T', '2025-07-20 17:07:00', '2025-07-20 16:07:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-20 12:08:06.832104', '2025-07-20 12:08:06.832104', 'b47c81da-35a2-4c8f-a187-b4b28f9a631f', 'pre_match', 500.00000000, '2025-07-20 12:08:06.832104', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('9340f85d-69f0-4945-a6cf-47cff80349fd', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder W vs Lightning H', 'soccer match between Thunder W and Lightning H', '2025-07-25 11:31:00', '2025-07-25 10:31:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:52:16.224954', '2025-07-18 16:52:16.224954', 'c08a5689-9ea5-47b1-85ca-a13b1604c0b6', 'pre_match', 500.00000000, '2025-07-18 16:52:16.224954', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('230ce2ca-3957-455f-b131-8337caeade66', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Campus Basketball Match', 'A test basketball match between Engineering and Business departments', '2025-07-13 02:28:09.785', '2025-07-13 01:28:09.785', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:56:30.340774', '2025-07-18 16:56:30.340774', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', 'pre_match', 750.00000000, '2025-07-18 16:56:30.340774', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1.3, "team_b_coefficient": 1.1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('65439fc4-77fd-4b58-973f-c95a915e8075', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Sample Campus Basketball Game', 'A sample basketball game for testing Phase 2 functionality', '2025-07-20 18:00:00', '2025-07-20 17:00:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 17:07:41.185317', '2025-07-18 17:07:41.185317', '0f3009a6-a665-4b06-bd9c-5158913886ed', 'pre_match', 500.00000000, '2025-07-18 17:07:41.185317', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('ac793df8-7dd8-4aae-943e-de10fcafadc0', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', ' Wolves vs Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-25 09:14:00', '2025-07-25 08:14:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-20 09:15:09.052756', '2025-07-20 09:15:09.052756', '8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c', 'pre_match', 1000.00000000, '2025-07-20 09:15:09.052756', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('80f87acc-91c7-4a44-b802-a5f8f7c662aa', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Campus Basketball Match', 'A test basketball match between Engineering and Business departments', '2025-07-13 02:28:09.785', '2025-07-13 01:28:09.785', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 11:15:29.139461', '2025-07-21 09:38:36.908191', '1a566485-d6c3-47f5-b3c1-fbe7f961b676', 'pre_match', 1000.00000000, '2025-07-18 11:15:29.153399', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '4809565a-9c3c-490f-96f9-35b969aa3049', '{}', 'team_a_wins', '2025-07-21 09:38:36.908191', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1, '1de6110a-f982-4f7f-979e-00e7f7d33bed', '2025-07-21 09:38:36.908191', 0, 'f', NULL),
('9b5ae883-e01d-4db4-953d-69fdb73f1c50', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Sample Campus Basketball Game', 'A sample basketball game for testing Phase 2 functionality', '2025-07-22 18:00:00', '2025-07-22 18:30:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-18 16:51:43.210641', '2025-07-20 12:04:06.612389', '0f3009a6-a665-4b06-bd9c-5158913886ed', 'pre_match', 500.00000000, '2025-07-18 16:51:43.210641', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('9b33b55c-c09e-41b9-b031-1c8680dd636a', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'lves vs Light', 'soccer match', '2025-07-21 11:44:00', '2025-07-21 10:44:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-20 11:45:33.597835', '2025-07-21 10:59:15.334155', '7b8efdfe-4d1e-4bdb-8719-d55c5b50a577', 'pre_match', 1500.00000000, '2025-07-20 11:45:33.597835', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-21 10:59:15.334155', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('b93c15d6-a7ec-4685-a9d2-c77f908cfc54', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'olves vs Lightn', 'soccer match between ', '2025-07-21 12:08:00', '2025-07-21 11:08:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-21 11:08:58.316034', '2025-07-21 11:32:13.340035', '307980bb-03da-45d9-8525-4f415351bfd5', 'pre_match', 521.00000000, '2025-07-21 11:08:58.316034', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_b_wins', '2025-07-21 11:32:13.340035', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 3, NULL, NULL, 0, 'f', NULL),
('b51bb12f-ffac-4d30-becb-dc9decb9e084', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder  vs Hawks', 'soccer match between Thunder  and Hawks', '2025-07-21 15:20:00', '2025-07-21 14:20:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-21 15:18:58.476091', '2025-07-21 15:21:20.332214', '78715345-0dfe-46eb-90d1-a5baba0f8d7b', 'pre_match', 1000.00000000, '2025-07-21 15:18:58.476091', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-21 15:21:20.332214', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('de00ca8a-c79f-43d7-898f-fb9e9b406492', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder2  vs Hawks2', 'soccer match between Thunder  and Hawks', '2025-07-21 15:33:00', '2025-07-21 14:33:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-21 15:31:42.666146', '2025-07-21 15:32:15.201691', '16c99005-d00d-49c8-8311-fd70ba122aca', 'pre_match', 300.01000000, '2025-07-21 15:31:42.666146', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-21 15:32:15.201691', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('91461b54-60ef-4498-bb89-6253910d068b', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T1', 'soccer match between Thunder  and Hawks', '2025-07-22 10:54:00', '2025-07-22 09:54:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 09:55:38.618229', '2025-07-22 09:56:28.688125', '191566bf-61c2-4c85-8015-d95dc3897542', 'pre_match', 531.00000000, '2025-07-22 09:55:38.618229', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-22 09:56:28.688125', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 1, NULL, NULL, 0, 'f', NULL),
('adad592a-7bff-49b7-9987-cf4c8df7b650', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T2', 'soccer match between Thunder  and Hawks', '2025-07-22 10:16:00', '2025-07-22 09:16:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 10:15:31.083777', '2025-07-22 10:17:44.743976', 'a3d6a825-087e-41d1-81f2-33b38cb8efff', 'pre_match', 2000.00000000, '2025-07-22 10:15:31.083777', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S9Thunder Wolves vs S9Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 09:35:00', '2025-07-23 08:35:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-23 09:33:48.06223', '2025-07-23 09:34:36.660638', 'd547c78b-338c-4fb2-b5e5-76a4f9f4d2ac', 'pre_match', 600.00000000, '2025-07-23 09:33:48.06223', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-23 09:34:36.660638', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('5830a693-615f-43ed-a942-cf5a511def4b', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T3', 'soccer match between Thunder  and Hawks', '2025-07-22 11:21:00', '2025-07-22 10:21:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 10:19:51.418956', '2025-07-22 10:21:25.721082', 'b767c3ca-4822-41f4-a709-82a4804d2ed1', 'pre_match', 2000.00000000, '2025-07-22 10:19:51.418956', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-22 10:21:25.721082', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('fca0afca-74bf-4558-8a84-56e8a769fa77', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S10Thunder Wolves vs S10Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 11:03:00', '2025-07-23 10:03:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-23 11:02:40.96244', '2025-07-23 11:07:59.323984', '0fc237e7-2e6e-4f4c-8b3b-b16db7ec27b9', 'pre_match', 700.00000000, '2025-07-23 11:02:40.96244', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-23 11:07:59.323984', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 1, NULL, NULL, 0, 'f', NULL),
('5d9d6cbc-3678-4d4d-8898-da41c8898954', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T5', 'soccer match between Thunder  and Hawks', '2025-07-22 10:53:00', '2025-07-22 09:53:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 10:33:40.92984', '2025-07-22 10:34:32.245017', 'cc010f2e-a25b-4402-892e-faa4d40504c9', 'pre_match', 600.00000000, '2025-07-22 10:33:40.92984', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-22 10:34:32.245017', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL),
('25a747ed-e75a-4e91-be83-915946d07fe3', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder Wolves6 vs Lightning Hawks6', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-22 11:18:00', '2025-07-22 10:18:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 11:18:00.325192', '2025-07-22 11:18:00.325192', '5918b3b7-b17c-4aa5-9b1f-b11c00b38b48', 'pre_match', 700.00000000, '2025-07-22 11:18:00.325192', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('b98c8740-6cef-40a9-a8a3-76998361cc3d', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Thunder Wolves7 vs Lightning Hawks7', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-22 11:20:00', '2025-07-22 10:20:00', 'active', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-22 11:20:17.722068', '2025-07-22 11:20:17.722068', '25a02569-8a1a-4995-adf4-fa77d9079c5b', 'pre_match', 760.00000000, '2025-07-22 11:20:17.722068', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', NULL, NULL, 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'f', NULL),
('432cbb23-a339-48c6-8418-055b2e2d72c0', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S11Thunder Wolves vs S11Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 17:22:00', '2025-07-23 16:22:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-23 17:21:09.70899', '2025-07-23 17:23:11.281518', 'a2dc82a1-fd8b-4278-a652-db70c341c7c7', 'pre_match', 600.00000000, '2025-07-23 17:21:09.70899', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-23 17:23:11.281518', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 3, NULL, NULL, 0, 'f', NULL),
('265e97d2-fe61-4b1a-9bcf-f409dd2cf019', NULL, NULL, '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S8Thunder Wolves vs S8Lightning Hawks', 'soccer match between Thunder Wolves and Lightning Hawks', '2025-07-23 09:10:00', '2025-07-23 08:10:00', 'completed', 0.00000000, 0.00000000, 100, 0, 'low', '{}', '2025-07-23 09:09:25.683548', '2025-07-23 09:10:08.229604', 'e02c5b7a-440b-4269-b40b-2deb96c67a12', 'pre_match', 530.00000000, '2025-07-23 09:09:25.683548', 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', NULL, '{"team_a_coefficient": 1, "team_b_coefficient": 1}', 'team_a_wins', '2025-07-23 09:10:08.229604', 0.00000000, 0.00000000, 0.00000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2, NULL, NULL, 0, 'f', NULL);
INSERT INTO "public"."fee_rules" ("id", "rule_name", "staking_fee_percent", "withdrawal_fee_percent", "distribution_fee_percent", "ambassador_share_percent", "athlete_share_percent", "community_fund_percent", "is_active", "effective_date", "created_by", "created_at", "updated_at") VALUES
('4809565a-9c3c-490f-96f9-35b969aa3049', 'Default Fee Structure', 5.00, 2.00, 3.00, 1.00, 1.00, 1.00, 't', '2025-07-11 09:39:20.750817', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817');

INSERT INTO "public"."match_result_announcements" ("id", "event_id", "announced_by", "team_a_score", "team_b_score", "match_result", "announcement_notes", "weather_conditions", "special_events", "is_verified", "verified_by", "verified_at", "created_at") VALUES
('1b82f71a-9e72-40aa-9917-a74f795a2510', '80f87acc-91c7-4a44-b802-a5f8f7c662aa', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 2, 1, 'team_a_wins', 'Test match result announcement', 'Sunny', 'None', 'f', NULL, NULL, '2025-07-21 09:38:36.917043'),
('eb2e1b0b-d6d2-41d6-a94d-fa994247f67a', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 2, 1, 'team_a_wins', 'Test match result with corrected mapping', NULL, NULL, 'f', NULL, NULL, '2025-07-21 10:31:03.146372'),
('6e49164a-f738-4455-a73c-b9bef8bf3e46', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 2, 1, 'team_a_wins', 'Direct API test', NULL, NULL, 'f', NULL, NULL, '2025-07-21 10:55:43.814548'),
('f070436e-507d-4974-8d85-7efb07d2c5ef', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 2, 1, 'team_a_wins', 'Direct API test', NULL, NULL, 'f', NULL, NULL, '2025-07-21 10:55:58.732912'),
('dcd1bb95-fab8-4314-b41b-751b4bb38e00', '9b33b55c-c09e-41b9-b031-1c8680dd636a', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-21 10:57:27.312172'),
('154f1679-c5d6-49b1-b188-6dd34411c986', '9b33b55c-c09e-41b9-b031-1c8680dd636a', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-21 10:59:15.334155'),
('84da8d24-24fc-4eac-901b-a42850a6ffca', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 2, 3, 'team_b_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-21 11:32:13.340035'),
('8d0df75f-7fb1-47b8-aeca-ac5e0f341ffe', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-21 15:21:20.332214'),
('f33e2be6-1363-4c74-b02d-129e55b165ad', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-21 15:32:15.201691'),
('cfd1f669-2843-48a1-9f19-5b626b3b2cff', '91461b54-60ef-4498-bb89-6253910d068b', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 1, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-22 09:56:28.688125'),
('031003ab-7609-42bd-8cff-1d2424dafa36', '5830a693-615f-43ed-a942-cf5a511def4b', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-22 10:21:25.721082'),
('fcae4adc-21bf-4a4d-a9fd-79a11db3a01d', '5d9d6cbc-3678-4d4d-8898-da41c8898954', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-22 10:34:32.245017'),
('53e388be-67bd-4ce8-9804-b718b6fbd633', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-23 09:10:08.229604'),
('bcbe7076-477a-4f0d-b477-03e39dab363e', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 3, 2, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-23 09:34:36.660638'),
('2693952d-1fd7-4bdb-9874-114680c98327', 'fca0afca-74bf-4558-8a84-56e8a769fa77', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 4, 1, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-23 11:07:59.323984'),
('d3cf4eb0-c691-4914-9890-7e05e9a56e70', '432cbb23-a339-48c6-8418-055b2e2d72c0', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 5, 3, 'team_a_wins', '', NULL, NULL, 'f', NULL, NULL, '2025-07-23 17:23:11.281518');

INSERT INTO "public"."match_status_transitions" ("id", "event_id", "from_status", "to_status", "transition_reason", "triggered_by", "trigger_type", "context_data", "created_at") VALUES
('fdfb41bd-9175-44f1-b7ec-d24ba62b8b3f', '80f87acc-91c7-4a44-b802-a5f8f7c662aa', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 11:15:29.139461'),
('caef16ec-b5dc-4183-95b7-e043572273c0', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 15:39:50.226285'),
('3fa7c0ca-f523-4c9a-82b0-cfa23cf21af7', '7ed276d2-3627-4ca0-91aa-7d2b720c5645', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 15:54:13.167133'),
('52e6fe64-4daa-43a1-ad7e-eb20b7d358a1', '9ef9b97b-73ef-4e12-8ea3-eedf98c1354a', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:25:49.6776'),
('9d929030-512b-48ed-80ce-dc835a8d1598', 'ec003340-a440-45ff-bdff-39d9b19d4387', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:29:11.170879'),
('10ddfe7b-5dcb-44dc-a1b8-4a2b976247d8', '508d43c2-d744-4b15-b0d5-ee237f641b09', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:35:33.668727'),
('0f1a62b4-eea8-462b-837d-f7915c919aea', 'b42349bb-bfcc-4288-adc1-c78b0a9c7ecd', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:45:01.876026'),
('1cdb34a8-c7a6-4d20-bcc9-677277da035a', '577b60cd-8479-4588-a4ef-777022d2f80c', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:46:17.286288'),
('d22d64f7-3e09-4f85-a156-867e197afdcc', '9b5ae883-e01d-4db4-953d-69fdb73f1c50', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:51:43.210641'),
('1b089f34-85b8-4137-9dae-2d4620802f2c', '9340f85d-69f0-4945-a6cf-47cff80349fd', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:52:16.224954'),
('0266f0b2-c6d6-4012-9874-8fc4f4c2ea11', '230ce2ca-3957-455f-b131-8337caeade66', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 16:56:30.340774'),
('df4062f7-6ebb-43df-a66f-1a446ebb603d', '65439fc4-77fd-4b58-973f-c95a915e8075', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-18 17:07:41.185317'),
('840eb930-4422-4ece-b05f-734e2287b1e7', 'ac793df8-7dd8-4aae-943e-de10fcafadc0', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-20 09:15:09.052756'),
('dc775e12-459b-4893-89dc-503aaec8ab55', '9b33b55c-c09e-41b9-b031-1c8680dd636a', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-20 11:45:33.597835'),
('a809b440-e524-4bc8-a4ae-3ff4a7864f5d', 'b4c539e8-9632-44ff-a5af-7fad9708503f', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-20 12:08:06.832104'),
('1b27c6da-fbb7-4826-894e-43443bc03af6', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-21 11:08:58.316034'),
('471e1bd7-10f8-40a1-b870-34ce4f76950c', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-21 15:18:58.476091'),
('12f8fe84-b189-4fc6-a5a9-63107f105762', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-21 15:31:42.666146'),
('353ec158-857a-4f21-958e-92c6f1c9418f', '91461b54-60ef-4498-bb89-6253910d068b', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 09:55:38.618229'),
('298946e9-a13f-4b61-a166-188396fa85bf', 'adad592a-7bff-49b7-9987-cf4c8df7b650', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 10:15:31.083777'),
('f6d98f0a-7876-428d-bd15-12c335511bd3', '5830a693-615f-43ed-a942-cf5a511def4b', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 10:19:51.418956'),
('739e4672-7729-496c-8821-2109fd2277d0', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 10:33:40.92984'),
('a0a8968d-ad4c-45c2-8983-bba63bfb84e3', '25a747ed-e75a-4e91-be83-915946d07fe3', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 11:18:00.325192'),
('532de009-9d85-4ccf-a0b2-2b90177304ac', 'b98c8740-6cef-40a9-a8a3-76998361cc3d', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-22 11:20:17.722068'),
('cde0c437-8a0a-422f-ae74-467f892fa7dc', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-23 09:09:25.683548'),
('324bfe04-9208-4dc4-8c69-c24a6de53c60', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-23 09:33:48.06223'),
('8688d3b1-d29a-4a5b-84a2-2e5dbd614a47', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-23 11:02:40.96244'),
('d54d0b34-4671-475a-b008-42e21dcc1e87', '432cbb23-a339-48c6-8418-055b2e2d72c0', 'draft', 'pre_match', 'Event created from approved application', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'manual', '{}', '2025-07-23 17:21:09.70899');

INSERT INTO "public"."platform_fee_config" ("id", "fee_percentage", "is_active", "description", "updated_by", "created_at", "updated_at") VALUES
('ee313e9a-10cd-4844-84d8-010ac06a24cb', 5.000, 't', 'Default platform fee for reward calculations', NULL, '2025-07-20 10:34:50.98208', '2025-07-20 10:34:50.98208'),
('130501f6-7b54-425a-b293-73f7c661e822', 5.000, 't', 'Default platform fee for post-match reward calculations', NULL, '2025-07-21 09:34:47.951058', '2025-07-21 09:34:47.951058');





INSERT INTO "public"."reward_distributions" ("id", "event_id", "user_id", "stake_record_id", "original_stake_amount", "admin_pool_amount", "total_participants", "user_tier_coefficient", "base_reward", "platform_fee_percentage", "platform_fee_amount", "final_reward", "distribution_status", "distributed_at", "transaction_hash", "calculation_formula", "created_at", "updated_at") VALUES
('3eb44fe3-8443-472e-9493-be916658d87e', '91461b54-60ef-4498-bb89-6253910d068b', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 50.00000000, 531.00000000, 1, 1.000, 531.00000000, 5.000, 29.05000000, 551.95000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (531 × 100.00% × 1 + 50) × (1 - 5%) = 551.95 CHZ', '2025-07-22 09:56:28.688125', '2025-07-22 10:43:03.956081'),
('d3443c9d-1f99-4aff-93f6-9c0bf6084032', '5830a693-615f-43ed-a942-cf5a511def4b', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 50.00000000, 2000.00000000, 1, 0.700, 1400.00000000, 5.000, 72.50000000, 1377.50000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (2000 × 100.00% × 0.7 + 50) × (1 - 5%) = 1377.50 CHZ', '2025-07-22 10:21:25.721082', '2025-07-22 10:43:03.96031'),
('1e6128a1-fe8c-416e-8ed5-7a3e3758455e', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 100.00000000, 600.00000000, 1, 0.300, 180.00000000, 5.000, 14.00000000, 266.00000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (600 × 100.00% × 0.3 + 100) × (1 - 5%) = 266.00 CHZ', '2025-07-22 10:34:32.245017', '2025-07-22 10:43:03.962297'),
('9bb752da-5c00-43b8-a839-db1298308e9c', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 50.00000000, 530.00000000, 1, 0.700, 371.00000000, 5.000, 21.05000000, 399.95000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (530 × 100.00% × 0.7 + 50) × (1 - 5%) = 399.95 CHZ', '2025-07-23 09:10:08.229604', '2025-07-23 09:10:08.229604'),
('421efb23-7bd2-4e65-af6f-314ae6205b79', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 100.00000000, 600.00000000, 1, 0.700, 420.00000000, 5.000, 26.00000000, 494.00000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (600 × 100.00% × 0.7 + 100) × (1 - 5%) = 494.00 CHZ', '2025-07-23 09:34:36.660638', '2025-07-23 09:34:36.660638'),
('7d32ab83-541b-4f39-8504-c02b9e996ee8', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 25.00000000, 700.00000000, 1, 0.700, 490.00000000, 5.000, 25.75000000, 489.25000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (700 × 100.00% × 0.7 + 25) × (1 - 5%) = 489.25 CHZ', '2025-07-23 11:07:59.323984', '2025-07-23 11:07:59.323984'),
('973944f2-e4e9-434c-a1e1-0a6deed3fe54', '432cbb23-a339-48c6-8418-055b2e2d72c0', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', NULL, 25.00000000, 600.00000000, 1, 0.300, 180.00000000, 5.000, 10.25000000, 194.75000000, 'calculated', NULL, NULL, '流动性挖矿奖励 = (600 × 100.00% × 0.3 + 25) × (1 - 5%) = 194.75 CHZ', '2025-07-23 17:23:11.281518', '2025-07-23 17:23:11.281518');



INSERT INTO "public"."support_options" ("id", "event_id", "option_name", "option_description", "coefficient", "max_supporters", "current_supporters", "team_association", "is_active", "is_featured", "created_at", "updated_at") VALUES
('17cbc935-f9a4-4ada-9c6a-ab9fc8deb312', '80f87acc-91c7-4a44-b802-a5f8f7c662aa', 'Support Team A', 'Support Team A with 1.5x coefficient', 1.500, 0, 0, 'team_a', 't', 'f', '2025-07-18 11:15:29.159516', '2025-07-18 11:15:29.159516'),
('cabb8521-7622-4a2f-926f-3b5349e52fe4', '80f87acc-91c7-4a44-b802-a5f8f7c662aa', 'Support Team B', 'Support Team B with 1.2x coefficient', 1.200, 0, 0, 'team_b', 't', 'f', '2025-07-18 11:15:29.163928', '2025-07-18 11:15:29.163928'),
('1bbbab7b-536d-4235-a26a-7db75e7f8a31', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', 'Support Team A', NULL, 1.500, 0, 0, 'team_a', 't', 'f', '2025-07-18 15:39:50.226285', '2025-07-18 15:39:50.226285'),
('2427b93e-6654-41a5-9a6f-6d0ba510c9da', '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 15:39:50.226285', '2025-07-18 15:39:50.226285'),
('3b4a1fc6-93ee-42c5-b5c3-8b0e9aacd218', '7ed276d2-3627-4ca0-91aa-7d2b720c5645', 'Support Team A', NULL, 1.200, 0, 0, 'team_a', 't', 'f', '2025-07-18 15:54:13.167133', '2025-07-18 15:54:13.167133'),
('fe41f984-e52b-4be9-9dfd-052caaef2616', '7ed276d2-3627-4ca0-91aa-7d2b720c5645', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 15:54:13.167133', '2025-07-18 15:54:13.167133'),
('681e9b28-1e55-424d-a883-8b6e52a76318', '9ef9b97b-73ef-4e12-8ea3-eedf98c1354a', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:25:49.6776', '2025-07-18 16:25:49.6776'),
('a6a24b5e-f452-4be7-a81c-87a4635ff44d', '9ef9b97b-73ef-4e12-8ea3-eedf98c1354a', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:25:49.6776', '2025-07-18 16:25:49.6776'),
('cc23f294-65e5-43d5-af65-8924fc2acaea', 'ec003340-a440-45ff-bdff-39d9b19d4387', 'Support Team A', NULL, 1.300, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:29:11.170879', '2025-07-18 16:29:11.170879'),
('eee44d4d-8d0f-49a3-ab04-c17d8a00fe31', 'ec003340-a440-45ff-bdff-39d9b19d4387', 'Support Team B', NULL, 1.100, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:29:11.170879', '2025-07-18 16:29:11.170879'),
('f73da0aa-33da-4237-9816-f8fc5878d6c2', '508d43c2-d744-4b15-b0d5-ee237f641b09', 'Support Team A', NULL, 1.400, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:35:33.668727', '2025-07-18 16:35:33.668727'),
('69bcf37b-da9c-4266-a005-9f9ae3d39f54', '508d43c2-d744-4b15-b0d5-ee237f641b09', 'Support Team B', NULL, 1.200, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:35:33.668727', '2025-07-18 16:35:33.668727'),
('16616912-e283-4f92-803d-cfe951291c2c', 'b42349bb-bfcc-4288-adc1-c78b0a9c7ecd', 'Support Team A', NULL, 1.300, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:45:01.876026', '2025-07-18 16:45:01.876026'),
('810d5f45-e15a-42e7-a0ba-91f57c69daa3', 'b42349bb-bfcc-4288-adc1-c78b0a9c7ecd', 'Support Team B', NULL, 1.100, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:45:01.876026', '2025-07-18 16:45:01.876026'),
('ebafec7b-0048-4877-95d0-9c83c23c54d5', '577b60cd-8479-4588-a4ef-777022d2f80c', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:46:17.286288', '2025-07-18 16:46:17.286288'),
('46fc9cc6-fbff-4551-9c10-92d011b4c3a4', '577b60cd-8479-4588-a4ef-777022d2f80c', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:46:17.286288', '2025-07-18 16:46:17.286288'),
('77e00348-9cf4-4a28-9200-bae234f0fcd5', '9b5ae883-e01d-4db4-953d-69fdb73f1c50', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:51:43.210641', '2025-07-18 16:51:43.210641'),
('a7db6bcc-edba-4061-bbc4-fdc5e650e41e', '9b5ae883-e01d-4db4-953d-69fdb73f1c50', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:51:43.210641', '2025-07-18 16:51:43.210641'),
('8c6ee884-95e0-419f-9987-10259eb581da', '9340f85d-69f0-4945-a6cf-47cff80349fd', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:52:16.224954', '2025-07-18 16:52:16.224954'),
('333d6096-530b-4150-b549-932d16301d92', '9340f85d-69f0-4945-a6cf-47cff80349fd', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:52:16.224954', '2025-07-18 16:52:16.224954'),
('3d5e498a-e5c0-4fd8-b875-fe3afa5e0b79', '230ce2ca-3957-455f-b131-8337caeade66', 'Support Team A', NULL, 1.300, 0, 0, 'team_a', 't', 'f', '2025-07-18 16:56:30.340774', '2025-07-18 16:56:30.340774'),
('c4f3d065-26d1-4733-96b0-ddfb40e47bb3', '230ce2ca-3957-455f-b131-8337caeade66', 'Support Team B', NULL, 1.100, 0, 0, 'team_b', 't', 'f', '2025-07-18 16:56:30.340774', '2025-07-18 16:56:30.340774'),
('46269b7c-1cd6-4c69-90ca-2b4f0a6f3bf0', '65439fc4-77fd-4b58-973f-c95a915e8075', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-18 17:07:41.185317', '2025-07-18 17:07:41.185317'),
('5b254016-85bc-42fb-a7f8-1caf93e0f85c', '65439fc4-77fd-4b58-973f-c95a915e8075', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-18 17:07:41.185317', '2025-07-18 17:07:41.185317'),
('4ab4b39f-0abb-4d46-95fe-97aa7364004c', 'ac793df8-7dd8-4aae-943e-de10fcafadc0', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-20 09:15:09.052756', '2025-07-20 09:15:09.052756'),
('23ade5b5-38d7-4bf5-9b6d-fd2a82eb55ea', 'ac793df8-7dd8-4aae-943e-de10fcafadc0', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-20 09:15:09.052756', '2025-07-20 09:15:09.052756'),
('4df87255-b506-40cc-b0f6-02fa249c80d7', '9b33b55c-c09e-41b9-b031-1c8680dd636a', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-20 11:45:33.597835', '2025-07-20 11:45:33.597835'),
('27404855-9c3b-4354-a2ad-96e317b52217', '9b33b55c-c09e-41b9-b031-1c8680dd636a', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-20 11:45:33.597835', '2025-07-20 11:45:33.597835'),
('2cbbd16b-9142-4f1b-b5c9-0e7426d721dc', 'b4c539e8-9632-44ff-a5af-7fad9708503f', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-20 12:08:06.832104', '2025-07-20 12:08:06.832104'),
('ac64a80d-bded-4524-86a2-20376a4b0cb5', 'b4c539e8-9632-44ff-a5af-7fad9708503f', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-20 12:08:06.832104', '2025-07-20 12:08:06.832104'),
('52b5755e-2188-42ab-9f8f-7ac72b602975', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-21 11:08:58.316034', '2025-07-21 11:08:58.316034'),
('9e3a36d5-dbd8-42b0-b3e6-a06a7078afdf', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-21 11:08:58.316034', '2025-07-21 11:08:58.316034'),
('001514ed-b650-4d14-990f-3e714d5a0d1d', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-21 15:18:58.476091', '2025-07-21 15:18:58.476091'),
('b18ac8fb-36d7-4220-ac0f-a7b9310c35c3', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-21 15:18:58.476091', '2025-07-21 15:18:58.476091'),
('8a3ce832-1bf1-4921-987d-2afab6d344f3', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-21 15:31:42.666146', '2025-07-21 15:31:42.666146'),
('cd56746e-4f38-4314-84be-fed19f4309ee', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-21 15:31:42.666146', '2025-07-21 15:31:42.666146'),
('1a1835de-400b-4c97-9477-f65d787db835', '91461b54-60ef-4498-bb89-6253910d068b', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 09:55:38.618229', '2025-07-22 09:55:38.618229'),
('817401b5-b385-4c9c-9e15-de36cccf77ca', '91461b54-60ef-4498-bb89-6253910d068b', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 09:55:38.618229', '2025-07-22 09:55:38.618229'),
('f5e78d0a-b024-49ce-8a7d-1e018d3fba8a', 'adad592a-7bff-49b7-9987-cf4c8df7b650', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 10:15:31.083777', '2025-07-22 10:15:31.083777'),
('58181fdb-0a02-4c23-9064-5a02ae43deab', 'adad592a-7bff-49b7-9987-cf4c8df7b650', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 10:15:31.083777', '2025-07-22 10:15:31.083777'),
('5b218361-74a5-488b-899b-75ce80ddb9fa', '5830a693-615f-43ed-a942-cf5a511def4b', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 10:19:51.418956', '2025-07-22 10:19:51.418956'),
('dc828f1f-aa00-4e7f-8766-3d700e849f52', '5830a693-615f-43ed-a942-cf5a511def4b', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 10:19:51.418956', '2025-07-22 10:19:51.418956'),
('00678092-b508-49c1-89ee-2b9092cd6ee6', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 10:33:40.92984', '2025-07-22 10:33:40.92984'),
('f2505f54-ea15-4994-b0ea-158acc2ad7e8', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 10:33:40.92984', '2025-07-22 10:33:40.92984'),
('0386cc1c-b272-4dff-a211-a35fd070b5be', '25a747ed-e75a-4e91-be83-915946d07fe3', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 11:18:00.325192', '2025-07-22 11:18:00.325192'),
('c3c276af-b364-4420-b964-faec215b5a55', '25a747ed-e75a-4e91-be83-915946d07fe3', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 11:18:00.325192', '2025-07-22 11:18:00.325192'),
('2b7ed377-7a31-40d6-a291-a62c02eeb688', 'b98c8740-6cef-40a9-a8a3-76998361cc3d', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-22 11:20:17.722068', '2025-07-22 11:20:17.722068'),
('d009f441-d635-49da-9edc-c2b8061b3066', 'b98c8740-6cef-40a9-a8a3-76998361cc3d', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-22 11:20:17.722068', '2025-07-22 11:20:17.722068'),
('fa7f1439-48c1-4993-8d84-0519297364d5', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-23 09:09:25.683548', '2025-07-23 09:09:25.683548'),
('1cb40233-f014-4807-8010-924f562eb873', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-23 09:09:25.683548', '2025-07-23 09:09:25.683548'),
('ce131b3c-ae11-450d-a0cc-d90c64183248', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-23 09:33:48.06223', '2025-07-23 09:33:48.06223'),
('b553de0a-75b5-488d-9418-55b22c4c6688', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-23 09:33:48.06223', '2025-07-23 09:33:48.06223'),
('7b415306-81f1-4821-af9e-81b2773bb082', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-23 11:02:40.96244', '2025-07-23 11:02:40.96244'),
('4fe08e45-02dc-4420-94ac-3346e51661a2', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-23 11:02:40.96244', '2025-07-23 11:02:40.96244'),
('4ad0c907-b92f-479b-b49f-bd797f74557f', '432cbb23-a339-48c6-8418-055b2e2d72c0', 'Support Team A', NULL, 1.000, 0, 0, 'team_a', 't', 'f', '2025-07-23 17:21:09.70899', '2025-07-23 17:21:09.70899'),
('a22e0944-fb5a-4b67-9d27-18cce1411579', '432cbb23-a339-48c6-8418-055b2e2d72c0', 'Support Team B', NULL, 1.000, 0, 0, 'team_b', 't', 'f', '2025-07-23 17:21:09.70899', '2025-07-23 17:21:09.70899');
INSERT INTO "public"."system_config" ("id", "config_key", "config_value", "description", "is_active", "created_by", "created_at", "updated_at") VALUES
('521620bf-45e8-4834-8381-fbedfbe3cbac', 'platform_name', '"FanForce AI"', 'Platform name configuration', 't', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817'),
('2ef38a07-8a81-408a-9b27-0e201924a9fd', 'maintenance_mode', 'false', 'Global maintenance mode toggle', 't', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817'),
('1719b836-117c-40cb-abbd-b2803b3d79c3', 'max_concurrent_events', '10', 'Maximum concurrent events allowed', 't', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817'),
('4675ef74-ffde-47c0-b9e5-fbc9c93edb52', 'default_event_capacity', '100', 'Default event capacity', 't', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817'),
('2e1f79f9-1a29-451a-8d9f-5ecb8847e2b4', 'websocket_enabled', 'true', 'Enable WebSocket real-time features', 't', NULL, '2025-07-11 09:39:20.750817', '2025-07-11 09:39:20.750817'),
('55d0895f-bd62-460c-a430-8d47d5e5dc73', 'phase2_enabled', 'true', 'Enable Phase 2 features (Event Applications)', 't', NULL, '2025-07-11 10:05:49.247539', '2025-07-11 10:05:49.247539'),
('67ef3cbc-a497-4ca5-8ac1-fb253b06c35c', 'qr_code_default_expiry_hours', '4', 'Default QR code validity period in hours', 't', NULL, '2025-07-11 10:05:49.247539', '2025-07-11 10:05:49.247539'),
('a6e6b2d1-3725-4c03-9811-14dfb35f70da', 'max_events_per_ambassador', '5', 'Maximum concurrent events per ambassador', 't', NULL, '2025-07-11 10:05:49.247539', '2025-07-11 10:05:49.247539'),
('35ec2418-925d-45ad-9d59-326effa3cb2b', 'party_allocation_method', '"first_come"', 'Default party allocation method', 't', NULL, '2025-07-11 10:05:49.247539', '2025-07-11 10:05:49.247539');
INSERT INTO "public"."team_drafts" ("id", "ambassador_id", "draft_name", "sport_type", "team_a_name", "team_a_athletes", "team_a_metadata", "team_b_name", "team_b_athletes", "team_b_metadata", "status", "estimated_duration", "match_notes", "created_at", "updated_at") VALUES
('909bf4bb-39ba-4425-b3a0-f47b4077d33a', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S2', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-20 09:14:12.358601', '2025-07-20 09:14:12.358601'),
('f1acac58-f748-4db2-b748-da8878fef3d4', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S3', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-20 11:44:27.721439', '2025-07-20 11:44:27.721439'),
('2b7bde83-81bc-4a40-ad37-2485cccf701c', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Match Draft', 'soccer', 'Thunder Wolves', '[]', '{}', 'Lightning Hawks', '[]', '{}', 'draft', 90, 'Test match for MVP demonstration', '2025-07-17 14:41:41.270769', '2025-07-17 14:41:41.270769'),
('5fae737a-7a3c-40dd-bf30-296712ec7629', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'Test Match Draft', 'soccer', 'Thunder Wolves', '[]', '{}', 'Lightning Hawks', '[]', '{}', 'draft', 90, 'Test match for MVP demonstration', '2025-07-17 14:44:27.707227', '2025-07-17 14:44:27.707227'),
('a69b990c-f99d-4cdf-93c4-df3e309a164a', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S1', 'soccer', 'Thunder W', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning H', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-18 10:48:57.357907', '2025-07-18 10:48:57.357907'),
('c5dbfddd-36d8-4728-8018-a765d86cd26e', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S4', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-20 12:07:05.16604', '2025-07-20 12:07:05.16604'),
('04924111-77cc-44a8-a84b-018cf27975d0', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T1', 'soccer', 'Thunder ', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-21 15:17:55.377406', '2025-07-21 15:17:55.377406'),
('89c9f639-f9ff-45c0-8e9a-eda6cbd4512b', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'T6', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-22 11:17:16.888554', '2025-07-22 11:17:16.888554'),
('ac8eb53b-8ad4-4946-b7fc-43182dc777d3', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S7', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-22 11:19:40.122684', '2025-07-22 11:19:40.122684'),
('3832ff9d-96e3-48ba-bf4e-25ca0091d374', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S9', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-23 09:33:11.261739', '2025-07-23 09:33:11.261739'),
('e4f1b63b-5f80-493c-b76e-74c3e1b1d6d2', '1de6110a-f982-4f7f-979e-00e7f7d33bed', 'S11', 'soccer', 'Thunder Wolves', '["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"]', '{}', 'Lightning Hawks', '["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"]', '{}', 'draft', 90, '', '2025-07-23 17:19:09.820717', '2025-07-23 17:19:09.820717');



INSERT INTO "public"."user_stake_records" ("id", "user_id", "event_id", "stake_amount", "currency", "participation_tier", "team_choice", "status", "stake_time", "settlement_time", "created_at", "updated_at") VALUES
('d06c05b5-b803-4e03-b586-61e21cc16764', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'ac793df8-7dd8-4aae-943e-de10fcafadc0', 50.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-20 11:26:14.229253', NULL, '2025-07-20 11:26:14.229253', '2025-07-20 11:26:14.229253'),
('29a1bc86-2e45-4602-ad37-0735981a4e12', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '9b33b55c-c09e-41b9-b031-1c8680dd636a', 25.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-20 11:46:15.542263', NULL, '2025-07-20 11:46:15.542263', '2025-07-20 11:46:15.542263'),
('88c0079d-23da-41f3-aca5-a01097242b2b', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '65439fc4-77fd-4b58-973f-c95a915e8075', 50.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-20 15:26:54.633498', NULL, '2025-07-20 15:26:54.633498', '2025-07-20 15:26:54.633498'),
('e49a0e0e-bd05-45f3-aab2-593961987db5', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'b93c15d6-a7ec-4685-a9d2-c77f908cfc54', 50.00000000, 'CHZ', 2, 'team_b', 'active', '2025-07-21 11:09:24.663985', NULL, '2025-07-21 11:09:24.663985', '2025-07-21 11:09:24.663985'),
('2c0cc5c8-7f1b-4e78-8b83-0caaeda8cc3a', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'b51bb12f-ffac-4d30-becb-dc9decb9e084', 100.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-21 15:19:34.920682', NULL, '2025-07-21 15:19:34.920682', '2025-07-21 15:19:34.920682'),
('e0472b54-4ee1-4061-a96a-dd9550209fac', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'de00ca8a-c79f-43d7-898f-fb9e9b406492', 100.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-21 15:32:00.926204', NULL, '2025-07-21 15:32:00.926204', '2025-07-21 15:32:00.926204'),
('94dcfee0-df14-4962-858f-0b8754f99a0f', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '91461b54-60ef-4498-bb89-6253910d068b', 50.00000000, 'CHZ', 1, 'team_a', 'active', '2025-07-22 09:56:14.120609', NULL, '2025-07-22 09:56:14.120609', '2025-07-22 09:56:14.120609'),
('cd10f441-2cc2-41e2-b29d-b85dbdbb44a9', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'adad592a-7bff-49b7-9987-cf4c8df7b650', 100.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-22 10:18:32.084533', NULL, '2025-07-22 10:18:32.084533', '2025-07-22 10:18:32.084533'),
('fe93aaf6-8cc0-441d-9532-dddd37c43aee', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '5830a693-615f-43ed-a942-cf5a511def4b', 50.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-22 10:21:02.289417', NULL, '2025-07-22 10:21:02.289417', '2025-07-22 10:21:02.289417'),
('bf333459-75d6-4de1-9b3a-912a6ca51285', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '5d9d6cbc-3678-4d4d-8898-da41c8898954', 100.00000000, 'CHZ', 3, 'team_a', 'active', '2025-07-22 10:34:16.693482', NULL, '2025-07-22 10:34:16.693482', '2025-07-22 10:34:16.693482'),
('820c8840-0d19-4a80-9b2f-7d945c0b213d', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'b98c8740-6cef-40a9-a8a3-76998361cc3d', 100.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-22 11:20:46.183991', NULL, '2025-07-22 11:20:46.183991', '2025-07-22 11:20:46.183991'),
('334766dc-c5f8-4386-836d-28775467cdc4', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '265e97d2-fe61-4b1a-9bcf-f409dd2cf019', 50.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-23 09:09:54.163363', NULL, '2025-07-23 09:09:54.163363', '2025-07-23 09:09:54.163363'),
('2cae157f-6205-4e1f-9330-1588164d2893', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'a9d677a3-a3b9-4c7c-90fa-bba8faa77ac5', 100.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-23 09:34:21.655581', NULL, '2025-07-23 09:34:21.655581', '2025-07-23 09:34:21.655581'),
('1fdc5512-ee9d-4249-bb6f-74a5a4b78dd1', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', 'fca0afca-74bf-4558-8a84-56e8a769fa77', 25.00000000, 'CHZ', 2, 'team_a', 'active', '2025-07-23 11:06:49.841262', NULL, '2025-07-23 11:06:49.841262', '2025-07-23 11:06:49.841262'),
('9f777bff-4772-4a8d-9f41-3e8a65d778e7', 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', '432cbb23-a339-48c6-8418-055b2e2d72c0', 25.00000000, 'CHZ', 3, 'team_a', 'active', '2025-07-23 17:22:01.082899', NULL, '2025-07-23 17:22:01.082899', '2025-07-23 17:22:01.082899');
INSERT INTO "public"."users" ("id", "wallet_address", "role", "student_id", "profile_data", "virtual_chz_balance", "real_chz_balance", "reliability_score", "emergency_contact", "created_at", "updated_at", "icp_principal_id", "auth_type", "ethereum_address", "secondary_roles", "role_preferences") VALUES
('85c75c8c-7540-40ac-aae9-a4042aa87d59', '0x3456789012345678901234567890123456789012', 'athlete', 'ATH001', '{}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 10:24:05.653728', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('1073e907-c1b2-44b8-be18-512b47205b03', '0x4567890123456789012345678901234567890123', 'audience', 'AUD001', '{}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 10:24:05.653728', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('a5b38a48-ba57-43c7-a9f0-d69860a21791', '0x2234567890123456789012345678901234567890', 'audience', NULL, '{}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 11:03:17.389875', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('7b059b7b-870e-4f8f-aecf-a10221ae2a8a', '0x3234567890123456789012345678901234567890', 'audience', NULL, '{}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 11:03:18.41802', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('fb7554e2-e6e5-48f2-ade0-d9510703e8de', '0x4234567890123456789012345678901234567890', 'audience', NULL, '{}', 25.00000000, 0.00000000, 100, NULL, '2025-07-10 11:03:19.434634', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('d4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d', '0x1234567890123456789012345678901234567890', 'admin', 'ADMIN001', '{}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 10:24:05.653728', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('5e9e135d-36e0-4309-975e-8ce411ad4eb0', NULL, 'audience', NULL, '{}', 0.00000000, 0.00000000, 100, NULL, '2025-08-09 10:19:24.073558', '2025-08-09 10:38:27.549455', '75ps5-fwgjd-mdwrb-qq6ab-sagkb-li6ap-dplnp-nwggq-3lktb-ytwpj-7ae', 'icp', NULL, '[]', '{}'),
('9bfc59fa-1c0e-4f39-b45f-1d063432b22c', '0x1111111111111111111111111111111111111111', 'athlete', 'ATH001', '{"name": "Alex Chen", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.919388', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('58ebca77-3ce5-46f5-a00b-f797cd383c32', '0x2222222222222222222222222222222222222222', 'athlete', 'ATH002', '{"name": "Maria Rodriguez", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.927698', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b', '0x3333333333333333333333333333333333333333', 'athlete', 'ATH003', '{"name": "David Kim", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.93302', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('4603a95a-2df0-4553-88c6-0cf76095d1e0', '0x4444444444444444444444444444444444444444', 'athlete', 'ATH004', '{"name": "Sarah Johnson", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.937617', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('3b7a6d4f-ceba-4ee5-a394-852446e1d851', '0x5555555555555555555555555555555555555555', 'athlete', 'ATH005', '{"name": "Michael Brown", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.943638', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('164d9ef9-5d0d-449c-aecf-7d91b43863e6', '0x6666666666666666666666666666666666666666', 'athlete', 'ATH006', '{"name": "Emma Wilson", "sport": "soccer"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.949457', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('d7c65b4e-1211-48bd-be9a-c85447e0f905', '0x7777777777777777777777777777777777777777', 'athlete', 'ATH007', '{"name": "James Davis", "sport": "basketball"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.954579', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('683aacc7-d397-4608-aed9-cc7391906b4e', '0x8888888888888888888888888888888888888888', 'athlete', 'ATH008', '{"name": "Lisa Thompson", "sport": "basketball"}', 100.00000000, 0.00000000, 100, NULL, '2025-07-17 14:33:31.958663', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('1de6110a-f982-4f7f-979e-00e7f7d33bed', '0x2345678901234567890123456789012345678901', 'ambassador', 'AMB001', '{"name": "Sarah Chen", "contact": "@sarahc_sports", "studentId": "AMB2024001", "department": "Sports Management", "university": "Tech University"}', 0.00000000, 0.00000000, 100, NULL, '2025-07-10 10:24:05.653728', '2025-08-09 10:32:45.42613', NULL, 'wallet', NULL, '[]', '{}'),
('e25198b0-c53d-4761-a321-4ab472c09890', NULL, 'audience', NULL, '{}', 0.00000000, 0.00000000, 100, NULL, '2025-08-09 10:38:21.684022', '2025-08-09 10:38:21.684022', 'test-new-user-12345', 'icp', NULL, '[]', '{}');

INSERT INTO "public"."venues" ("id", "name", "address", "capacity", "available_capacity", "facilities", "status", "emergency_info", "created_at", "updated_at") VALUES
('11dd53e2-7432-43c5-aefb-f81b6e467f70', 'Campus Sports Center', '123 University Ave', 500, 500, '{}', 'active', '{}', '2025-07-10 10:24:05.670203', '2025-07-10 10:24:05.670203'),
('58a96d63-e662-4f9b-b09d-0ad4dd99e204', 'Student Union Hall', '456 College St', 200, 200, '{}', 'active', '{}', '2025-07-10 10:24:05.670203', '2025-07-10 10:24:05.670203');
