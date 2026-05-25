<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define('AGENT_BOOKING_DB_VERSION', '1.9');

function agent_booking_install() {

    agent_booking_create_roles();

    agent_booking_create_tables();
}

function agent_booking_update_db_check() {

    $installed_version =
        get_option(
            'agent_booking_db_version'
        );

    if (
        $installed_version !==
        AGENT_BOOKING_DB_VERSION
    ) {

        agent_booking_install();
    }
}
function agent_booking_create_tables() {

    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    $table_name =
        $wpdb->prefix . 'agent_booking_slots';


    $sql = "
    CREATE TABLE $table_name (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        agent_id BIGINT UNSIGNED NOT NULL,

        slot_start_utc DATETIME NOT NULL,
        slot_end_utc DATETIME NOT NULL,

        status VARCHAR(20) NOT NULL DEFAULT 'FREE',

        max_bookings INT UNSIGNED NOT NULL DEFAULT 1,

        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,

        PRIMARY KEY  (id),

        UNIQUE KEY idx_agent_date (
            agent_id,
            slot_start_utc
        ),

        KEY idx_status (
            status
        )

    ) $charset_collate ;
    ";


		$table_name3 =
        $wpdb->prefix . 'agent_weekly_rules';

		/**
		 * Weekday
		 * 
		 * 1 = Monday
		 * 7 = Sunday
		 */

		$sql3 = "
		CREATE TABLE $table_name3 (
				id BIGINT UNSIGNED AUTO_INCREMENT,

				agent_id BIGINT UNSIGNED NOT NULL,

				weekday TINYINT NOT NULL,
				
				start_time TIME NOT NULL,
				end_time TIME NOT NULL,

				slot_duration_minutes INT UNSIGNED NOT NULL DEFAULT 30,

				is_active TINYINT(1) NOT NULL DEFAULT 1,

				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,

				PRIMARY KEY  (id),

				KEY idx_agent_weekday (
						agent_id,
						weekday
				)
		) $charset_collate ;
		";

		$table_name4 =
        $wpdb->prefix . 'agent_days_off';
		$sql4 = "
		CREATE TABLE $table_name4 (
				id BIGINT UNSIGNED AUTO_INCREMENT,

				agent_id BIGINT UNSIGNED NOT NULL,

				off_start_utc DATETIME NOT NULL,
				off_end_utc DATETIME NOT NULL,

				reason VARCHAR(255),

				created_at DATETIME NOT NULL,

				PRIMARY KEY  (id),

				KEY idx_agent_off (
						agent_id,
						off_start_utc
				)
		) $charset_collate ;
		";

		$table_name7 =
        $wpdb->prefix . 'agent_booking_bookings';
		$sql7 = "
    CREATE TABLE $table_name7 (

				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

				slot_id BIGINT UNSIGNED NOT NULL,

				customer_name VARCHAR(255) NOT NULL,

				customer_email VARCHAR(255),

				customer_phone VARCHAR(100),

				status VARCHAR(20)
						NOT NULL DEFAULT 'PENDING',

				confirmed_by BIGINT UNSIGNED,

				confirmed_at DATETIME,

				created_by BIGINT UNSIGNED,

				created_at DATETIME NOT NULL,

				updated_at DATETIME NOT NULL,

				PRIMARY KEY (id),

				UNIQUE KEY uniq_slot_booking (
						slot_id
				),

				KEY idx_status (
						status
				),

				KEY idx_created_by (
						created_by
				)

		) $charset_collate;
    ";

		/*
			note_type:
					CUSTOMER
					AGENT
					SYSTEM
					EMAIL
					CALL
					STATUS_CHANGE

			visibility:
					PUBLIC
					CUSTOMER
					AGENT
					ADMIN
		*/
		$table_name6 =
        $wpdb->prefix . 'agent_booking_notes';
		$sql6 = "
    CREATE TABLE $table_name6 (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

				booking_id BIGINT UNSIGNED NOT NULL,

				author_user_id BIGINT UNSIGNED,

				note_type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',

				visibility VARCHAR(20) NOT NULL DEFAULT 'AGENT',

				note TEXT NOT NULL,

				created_at DATETIME NOT NULL,

				PRIMARY KEY (id),

				KEY idx_booking (
						booking_id
				),

				KEY idx_author (
						author_user_id
				),

				KEY idx_visibility (
						visibility
				)
		) $charset_collate ;
    ";

    require_once(
        ABSPATH . 'wp-admin/includes/upgrade.php'
    );

    dbDelta($sql);
    
    dbDelta($sql3);
    dbDelta($sql4);
    dbDelta($sql7);
    dbDelta($sql6);

		$index_exists = $wpdb->get_var(
				"
				SHOW INDEX
				FROM {$table_name}
				WHERE Key_name = 'uniq_slot'
				"
		);

		if (!$index_exists) {

				$wpdb->query(
						"
						ALTER TABLE {$table_name}

						ADD UNIQUE KEY uniq_slot (
								agent_id,
								slot_start_utc
						)
						"
				);
		}

    update_option(
        'agent_booking_db_version',
        AGENT_BOOKING_DB_VERSION
    );
}