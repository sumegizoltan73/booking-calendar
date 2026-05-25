<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define('BOOKING_CALENDAR_DB_VERSION', '2.0');

function booking_calendar_install() {

    booking_calendar_create_roles();

    booking_calendar_create_tables();
}

function booking_calendar_update_db_check() {

    $installed_version =
        get_option(
            'booking_calendar_db_version'
        );

    if (
        $installed_version !==
        BOOKING_CALENDAR_DB_VERSION
    ) {

        booking_calendar_install();
    }
}
function booking_calendar_create_tables() {

    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    $table_name =
        $wpdb->prefix . 'hotel_booking_calendar_slots';


    $sql = "
    CREATE TABLE $table_name (

        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        room_id BIGINT UNSIGNED NOT NULL,

        slot_start_utc DATETIME NOT NULL,
        slot_end_utc DATETIME NOT NULL,

        status VARCHAR(20) NOT NULL DEFAULT 'FREE',

        max_bookings INT UNSIGNED NOT NULL DEFAULT 1,

        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,

        PRIMARY KEY  (id),

        UNIQUE KEY idx_room_date (
            room_id,
            slot_start_utc
        ),

        KEY idx_status (
            status
        )

    ) $charset_collate ;
    ";


		$table_name3 =
        $wpdb->prefix . 'hotel_weekly_rules';

		/**
		 * Weekday
		 * 
		 * 1 = Monday
		 * 7 = Sunday
		 */

		$sql3 = "
		CREATE TABLE $table_name3 (
				id BIGINT UNSIGNED AUTO_INCREMENT,

				room_id BIGINT UNSIGNED NOT NULL,

				weekday TINYINT NOT NULL,
				
				start_time TIME NOT NULL,
				end_time TIME NOT NULL,

				slot_duration_minutes INT UNSIGNED NOT NULL DEFAULT 30,

				is_active TINYINT(1) NOT NULL DEFAULT 1,

				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,

				PRIMARY KEY  (id),

				KEY idx_room_weekday (
						room_id,
						weekday
				)
		) $charset_collate ;
		";

		$table_name4 =
        $wpdb->prefix . 'hotel_days_off';
		$sql4 = "
		CREATE TABLE $table_name4 (
				id BIGINT UNSIGNED AUTO_INCREMENT,

				room_id BIGINT UNSIGNED NOT NULL,

				off_start_utc DATETIME NOT NULL,
				off_end_utc DATETIME NOT NULL,

				reason VARCHAR(255),

				created_at DATETIME NOT NULL,

				PRIMARY KEY  (id),

				KEY idx_room_off (
						room_id,
						off_start_utc
				)
		) $charset_collate ;
		";

		$table_name7 =
        $wpdb->prefix . 'hotel_booking_bookings';
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
        $wpdb->prefix . 'hotel_booking_notes';
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
        'booking_calendar_db_version',
        BOOKING_CALENDAR_DB_VERSION
    );
}