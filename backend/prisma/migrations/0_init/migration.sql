-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `primary_role` ENUM('aspiring_entrepreneur', 'founder', 'mentor') NULL,
    `additional_roles` JSON NULL,
    `admin_level` ENUM('super_admin', 'moderator') NULL,
    `account_status` ENUM('pending_verification', 'pending_approval', 'active', 'suspended', 'revoked', 'blacklisted', 'deactivated') NOT NULL DEFAULT 'pending_verification',
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `phone` VARCHAR(50) NULL,
    `phone_verified_at` DATETIME(3) NULL,
    `mfa_enabled` BOOLEAN NOT NULL DEFAULT false,
    `mfa_secret` VARCHAR(512) NULL,
    `mfa_backup_codes` JSON NULL,
    `unlock_animation_pending` BOOLEAN NOT NULL DEFAULT false,
    `time_zone` VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_account_status_idx`(`account_status`),
    INDEX `users_primary_role_idx`(`primary_role`),
    INDEX `users_admin_level_idx`(`admin_level`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `mfa_verified` BOOLEAN NOT NULL DEFAULT false,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `last_active_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_identities` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `provider_user_id` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auth_identities_user_id_idx`(`user_id`),
    UNIQUE INDEX `auth_identities_provider_provider_user_id_key`(`provider`, `provider_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `email` VARCHAR(255) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `type` ENUM('email_verify', 'password_reset', 'email_change', 'set_password') NOT NULL,
    `metadata` JSON NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `verification_tokens_token_hash_key`(`token_hash`),
    INDEX `verification_tokens_email_idx`(`email`),
    INDEX `verification_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_verifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `otp_hash` VARCHAR(64) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `phone_verifications_user_id_idx`(`user_id`),
    INDEX `phone_verifications_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `submitted_profile_snapshot` JSON NOT NULL,
    `status` ENUM('not_started', 'pending', 'approved', 'rejected', 'info_requested', 'withdrawn') NOT NULL DEFAULT 'pending',
    `expedited` BOOLEAN NOT NULL DEFAULT false,
    `can_reapply_at` DATETIME(3) NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_by` CHAR(36) NULL,
    `claimed_by` CHAR(36) NULL,
    `claimed_at` DATETIME(3) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `decision_reason` TEXT NULL,
    `decision_rubric` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `applications_user_id_idx`(`user_id`),
    INDEX `applications_status_idx`(`status`),
    INDEX `applications_claimed_by_idx`(`claimed_by`),
    INDEX `applications_claimed_at_idx`(`claimed_at`),
    INDEX `applications_submitted_at_idx`(`submitted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_messages` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `author_type` ENUM('admin', 'applicant') NOT NULL,
    `body` TEXT NOT NULL,
    `attachments` JSON NULL,
    `is_internal_note` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_messages_application_id_idx`(`application_id`),
    INDEX `application_messages_author_id_idx`(`author_id`),
    INDEX `application_messages_is_internal_note_idx`(`is_internal_note`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `legal_documents` (
    `id` CHAR(36) NOT NULL,
    `type` ENUM('privacy_notice', 'community_guidelines') NOT NULL,
    `version` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_by` CHAR(36) NULL,

    INDEX `legal_documents_type_is_current_idx`(`type`, `is_current`),
    UNIQUE INDEX `legal_documents_type_version_key`(`type`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consent_records` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `document_type` ENUM('privacy_notice', 'community_guidelines') NOT NULL,
    `document_version` VARCHAR(50) NOT NULL,
    `accepted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(45) NULL,

    INDEX `consent_records_user_id_idx`(`user_id`),
    INDEX `consent_records_document_type_document_version_idx`(`document_type`, `document_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `headline` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL DEFAULT 'India',
    `profile_photo_url` VARCHAR(1024) NULL,
    `photo_file_id` CHAR(36) NULL,
    `linkedin_url` VARCHAR(512) NULL,
    `twitter_url` VARCHAR(512) NULL,
    `github_url` VARCHAR(512) NULL,
    `website_url` VARCHAR(512) NULL,
    `mentor_verified` BOOLEAN NOT NULL DEFAULT false,
    `mentor_availability` VARCHAR(50) NOT NULL DEFAULT 'active',
    `max_mentees` INTEGER NULL,
    `preferred_contact_method` VARCHAR(100) NULL,
    `visibility_settings` JSON NULL,
    `contact_preferences` JSON NULL,
    `role_attributes` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_user_id_key`(`user_id`),
    INDEX `profiles_city_idx`(`city`),
    INDEX `profiles_mentor_verified_idx`(`mentor_verified`),
    INDEX `profiles_mentor_availability_idx`(`mentor_availability`),
    FULLTEXT INDEX `profiles_name_bio_headline_idx`(`name`, `bio`, `headline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_change_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `field_key` VARCHAR(100) NOT NULL,
    `current_value` JSON NULL,
    `proposed_value` JSON NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `reviewed_by` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `profile_change_requests_user_id_idx`(`user_id`),
    INDEX `profile_change_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expertise_tags` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('sector', 'expertise', 'general') NOT NULL DEFAULT 'general',
    `status` ENUM('active', 'retired') NOT NULL DEFAULT 'active',
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `expertise_tags_name_key`(`name`),
    INDEX `expertise_tags_category_idx`(`category`),
    INDEX `expertise_tags_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_tags` (
    `profile_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,

    INDEX `profile_tags_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`profile_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `startups` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `industry` VARCHAR(100) NULL,
    `stage` VARCHAR(50) NULL,
    `product_summary` TEXT NULL,
    `website` VARCHAR(512) NULL,
    `location` VARCHAR(100) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `startups_name_key`(`name`),
    INDEX `startups_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `startup_members` (
    `id` CHAR(36) NOT NULL,
    `startup_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role_in_startup` VARCHAR(100) NULL,

    INDEX `startup_members_user_id_idx`(`user_id`),
    UNIQUE INDEX `startup_members_startup_id_user_id_key`(`startup_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `type` ENUM('question', 'suggestion', 'resource', 'opportunity') NOT NULL DEFAULT 'question',
    `title` VARCHAR(200) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'Question',
    `status` ENUM('published', 'hidden', 'deleted') NOT NULL DEFAULT 'published',
    `is_resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolved_answer_id` CHAR(36) NULL,
    `original_body` MEDIUMTEXT NULL,
    `edited_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `posts_author_id_idx`(`author_id`),
    INDEX `posts_status_idx`(`status`),
    INDEX `posts_type_idx`(`type`),
    INDEX `posts_category_idx`(`category`),
    INDEX `posts_created_at_idx`(`created_at`),
    FULLTEXT INDEX `posts_title_body_idx`(`title`, `body`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `post_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,

    INDEX `post_tags_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`post_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_responses` (
    `id` CHAR(36) NOT NULL,
    `post_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('published', 'hidden', 'deleted') NOT NULL DEFAULT 'published',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `post_responses_post_id_idx`(`post_id`),
    INDEX `post_responses_author_id_idx`(`author_id`),
    INDEX `post_responses_status_idx`(`status`),
    INDEX `post_responses_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `media_url` VARCHAR(1024) NULL,
    `media_type` VARCHAR(50) NULL,
    `status` ENUM('pending_review', 'approved', 'rejected', 'expired', 'archived') NOT NULL DEFAULT 'pending_review',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `achievements_author_id_idx`(`author_id`),
    INDEX `achievements_status_idx`(`status`),
    INDEX `achievements_approved_at_idx`(`approved_at`),
    INDEX `achievements_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `connection_requests` (
    `id` CHAR(36) NOT NULL,
    `sender_id` CHAR(36) NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `responded_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NOT NULL,

    INDEX `connection_requests_sender_id_idx`(`sender_id`),
    INDEX `connection_requests_recipient_id_idx`(`recipient_id`),
    INDEX `connection_requests_status_idx`(`status`),
    INDEX `connection_requests_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_blocks` (
    `id` CHAR(36) NOT NULL,
    `blocker_id` CHAR(36) NOT NULL,
    `blocked_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `member_blocks_blocked_id_idx`(`blocked_id`),
    UNIQUE INDEX `member_blocks_blocker_id_blocked_id_key`(`blocker_id`, `blocked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `venue_or_link` VARCHAR(512) NULL,
    `meeting_link` VARCHAR(512) NULL,
    `capacity` INTEGER NULL,
    `waitlist_enabled` BOOLEAN NOT NULL DEFAULT true,
    `registration_deadline` DATETIME(3) NULL,
    `visibility` ENUM('all_members', 'specific_roles', 'invite_only') NOT NULL DEFAULT 'all_members',
    `visible_to_roles` JSON NULL,
    `status` ENUM('draft', 'published', 'cancelled', 'archived', 'completed') NOT NULL DEFAULT 'draft',
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_start_at_idx`(`start_at`),
    INDEX `events_status_idx`(`status`),
    INDEX `events_visibility_idx`(`visibility`),
    INDEX `events_created_by_idx`(`created_by`),
    FULLTEXT INDEX `events_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_form_fields` (
    `id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `field_label` VARCHAR(255) NOT NULL,
    `field_type` VARCHAR(50) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `options` JSON NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `event_form_fields_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_registrations` (
    `id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `responses` JSON NULL,
    `status` ENUM('registered', 'waitlisted', 'cancelled', 'promoted') NOT NULL DEFAULT 'registered',
    `waitlist_position` INTEGER NULL,
    `checked_in_at` DATETIME(3) NULL,
    `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cancelled_at` DATETIME(3) NULL,

    INDEX `event_registrations_user_id_idx`(`user_id`),
    INDEX `event_registrations_event_id_status_idx`(`event_id`, `status`),
    UNIQUE INDEX `event_registrations_event_id_user_id_key`(`event_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_tags` (
    `event_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,

    INDEX `event_tags_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`event_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_invitees` (
    `id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,

    INDEX `event_invitees_user_id_idx`(`user_id`),
    UNIQUE INDEX `event_invitees_event_id_user_id_key`(`event_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` CHAR(36) NOT NULL,
    `owner_id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `notes` TEXT NULL,
    `kind` ENUM('task', 'deadline') NOT NULL DEFAULT 'task',
    `due_at` DATETIME(3) NULL,
    `priority` ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',
    `status` ENUM('open', 'completed', 'archived') NOT NULL DEFAULT 'open',
    `reminder_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tasks_owner_id_idx`(`owner_id`),
    INDEX `tasks_status_idx`(`status`),
    INDEX `tasks_due_at_idx`(`due_at`),
    INDEX `tasks_reminder_at_idx`(`reminder_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `delivery_channel` ENUM('in_app', 'email', 'both') NOT NULL DEFAULT 'in_app',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_deliveries` (
    `id` CHAR(36) NOT NULL,
    `notification_id` CHAR(36) NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `read_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `delivery_status` ENUM('pending', 'sent', 'failed', 'bounced') NOT NULL DEFAULT 'pending',

    INDEX `notification_deliveries_recipient_id_read_at_idx`(`recipient_id`, `read_at`),
    INDEX `notification_deliveries_delivery_status_idx`(`delivery_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `notification_type` VARCHAR(100) NOT NULL,
    `channel_email` BOOLEAN NOT NULL DEFAULT true,
    `channel_in_app` BOOLEAN NOT NULL DEFAULT true,
    `is_essential` BOOLEAN NOT NULL DEFAULT false,

    INDEX `notification_preferences_user_id_idx`(`user_id`),
    UNIQUE INDEX `notification_preferences_user_id_notification_type_key`(`user_id`, `notification_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_subscriptions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `endpoint` VARCHAR(1024) NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `push_subscriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `target_roles` JSON NULL,
    `expires_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `announcements_expires_at_idx`(`expires_at`),
    INDEX `announcements_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_reports` (
    `id` CHAR(36) NOT NULL,
    `reporter_id` CHAR(36) NOT NULL,
    `target_type` ENUM('post', 'response', 'achievement', 'profile') NOT NULL,
    `target_id` CHAR(36) NOT NULL,
    `reason_category` ENUM('spam', 'harassment', 'misinformation', 'other') NOT NULL,
    `reason_detail` TEXT NULL,
    `status` ENUM('pending', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `resolution_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `content_reports_target_type_target_id_idx`(`target_type`, `target_id`),
    INDEX `content_reports_status_idx`(`status`),
    INDEX `content_reports_reporter_id_idx`(`reporter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restrictions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('warning', 'suspension', 'revocation', 'blacklist') NOT NULL,
    `reason` TEXT NOT NULL,
    `issued_by` CHAR(36) NOT NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `resolved_at` DATETIME(3) NULL,
    `resolved_by` CHAR(36) NULL,

    INDEX `restrictions_user_id_idx`(`user_id`),
    INDEX `restrictions_type_idx`(`type`),
    INDEX `restrictions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `target_type` VARCHAR(100) NOT NULL,
    `target_id` CHAR(36) NULL,
    `reason` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `metadata` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actor_id_idx`(`actor_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_target_type_target_id_idx`(`target_type`, `target_id`),
    INDEX `audit_logs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invite_links` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `pre_approved_role` ENUM('aspiring_entrepreneur', 'founder', 'mentor') NOT NULL DEFAULT 'founder',
    `token_hash` VARCHAR(64) NOT NULL,
    `status` ENUM('pending', 'used', 'expired') NOT NULL DEFAULT 'pending',
    `registered_user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,

    UNIQUE INDEX `invite_links_token_hash_key`(`token_hash`),
    INDEX `invite_links_email_idx`(`email`),
    INDEX `invite_links_status_idx`(`status`),
    INDEX `invite_links_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklist_identifiers` (
    `id` CHAR(36) NOT NULL,
    `identifier_hash` VARCHAR(64) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blacklist_identifiers_identifier_hash_key`(`identifier_hash`),
    INDEX `blacklist_identifiers_identifier_hash_idx`(`identifier_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grievance_cases` (
    `id` CHAR(36) NOT NULL,
    `case_id` VARCHAR(50) NOT NULL,
    `submitter_id` CHAR(36) NULL,
    `email` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` MEDIUMTEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'open',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grievance_cases_case_id_key`(`case_id`),
    INDEX `grievance_cases_case_id_idx`(`case_id`),
    INDEX `grievance_cases_status_idx`(`status`),
    INDEX `grievance_cases_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` CHAR(36) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed', 'dead_letter') NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `run_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `locked_at` DATETIME(3) NULL,
    `locked_by` VARCHAR(100) NULL,
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `jobs_status_run_at_idx`(`status`, `run_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_outbox` (
    `id` CHAR(36) NOT NULL,
    `to` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `html_body` MEDIUMTEXT NOT NULL,
    `text_body` MEDIUMTEXT NULL,
    `status` ENUM('pending', 'sent', 'failed', 'bounced') NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `error_message` TEXT NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_outbox_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploaded_files` (
    `id` CHAR(36) NOT NULL,
    `owner_id` CHAR(36) NULL,
    `purpose` ENUM('profile_photo', 'achievement_media', 'application_attachment', 'verification_evidence', 'export_download') NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `storage_key` VARCHAR(512) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `sha256` VARCHAR(64) NOT NULL,
    `scan_status` ENUM('pending', 'clean', 'infected', 'skipped') NOT NULL DEFAULT 'pending',
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `uploaded_files_owner_id_idx`(`owner_id`),
    INDEX `uploaded_files_storage_key_idx`(`storage_key`),
    INDEX `uploaded_files_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_export_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `file_url` VARCHAR(1024) NULL,
    `storage_key` VARCHAR(512) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `data_export_requests_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deletion_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `scheduled_for` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `deletion_requests_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_logs` (
    `id` CHAR(36) NOT NULL,
    `query` VARCHAR(255) NOT NULL,
    `zero_results` BOOLEAN NOT NULL DEFAULT false,
    `result_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `search_logs_query_idx`(`query`),
    INDEX `search_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_synonyms` (
    `id` CHAR(36) NOT NULL,
    `term` VARCHAR(100) NOT NULL,
    `synonyms` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `search_synonyms_term_key`(`term`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_events` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `name` VARCHAR(100) NOT NULL,
    `props` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_name_created_at_idx`(`name`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_identities` ADD CONSTRAINT `auth_identities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_claimed_by_fkey` FOREIGN KEY (`claimed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_messages` ADD CONSTRAINT `application_messages_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_messages` ADD CONSTRAINT `application_messages_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consent_records` ADD CONSTRAINT `consent_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_change_requests` ADD CONSTRAINT `profile_change_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_tags` ADD CONSTRAINT `profile_tags_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_tags` ADD CONSTRAINT `profile_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `expertise_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `startups` ADD CONSTRAINT `startups_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `startup_members` ADD CONSTRAINT `startup_members_startup_id_fkey` FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `startup_members` ADD CONSTRAINT `startup_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `expertise_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_responses` ADD CONSTRAINT `post_responses_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_responses` ADD CONSTRAINT `post_responses_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `connection_requests` ADD CONSTRAINT `connection_requests_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `connection_requests` ADD CONSTRAINT `connection_requests_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_blocks` ADD CONSTRAINT `member_blocks_blocker_id_fkey` FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_blocks` ADD CONSTRAINT `member_blocks_blocked_id_fkey` FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_form_fields` ADD CONSTRAINT `event_form_fields_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_tags` ADD CONSTRAINT `event_tags_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_tags` ADD CONSTRAINT `event_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `expertise_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_invitees` ADD CONSTRAINT `event_invitees_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_invitees` ADD CONSTRAINT `event_invitees_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_reports` ADD CONSTRAINT `content_reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_reports` ADD CONSTRAINT `content_reports_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restrictions` ADD CONSTRAINT `restrictions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restrictions` ADD CONSTRAINT `restrictions_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restrictions` ADD CONSTRAINT `restrictions_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite_links` ADD CONSTRAINT `invite_links_registered_user_id_fkey` FOREIGN KEY (`registered_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `data_export_requests` ADD CONSTRAINT `data_export_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deletion_requests` ADD CONSTRAINT `deletion_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Append-only triggers for audit_logs
CREATE TRIGGER `audit_logs_no_update` BEFORE UPDATE ON `audit_logs`
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Audit logs are append-only. Updates are forbidden.';
END;

CREATE TRIGGER `audit_logs_no_delete` BEFORE DELETE ON `audit_logs`
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Audit logs are append-only. Deletes are forbidden.';
END;

