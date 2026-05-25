<?php
/*
 * Plugin Name:       Booking Calendar Plugin
 * Plugin URI:        https://github.com/sumegizoltan73/booking-calendar
 * Description:       Hotel booking calendar - WordPress plugin.
 * Version:           0.1.7
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Zoltan Peter Sumegi & ChatGPT
 * Author URI:        https://www.sumegizoltanpeter.hu/
 * License:           MIT
 * License URI:       https://mit-license.org
 * Update URI:        https://programozo.info.hu/booking-calendar/
 * Text Domain:       booking-calendar
 * Domain Path:       languages
 * Requires Plugins:  
 */


add_action( 'plugins_loaded', 'booking_calendar_plugin_load_textdomain' );

require_once __DIR__ . '/includes/shortcode.php';
require_once __DIR__ . '/includes/widget.php';
require_once __DIR__ . '/includes/slots.php';
require_once __DIR__ . '/includes/routes.php';
require_once plugin_dir_path(__FILE__) . 'includes/roles.php';
require_once plugin_dir_path(__FILE__) . 'includes/db.php';
require_once __DIR__ . '/includes/rooms.php';
require_once __DIR__ . '/includes/admin.php';
require_once __DIR__ . '/includes/cron.php';


/**
 * Activation hook.
 */
register_activation_hook(
    __FILE__,
    'booking_calendar_install'
);
add_action(
    'plugins_loaded',
    'booking_calendar_update_db_check'
);

/**
 * Register our wporg_settings_init to the admin_init action hook.
 */
add_action( 'admin_init', 'booking_calendar_settings_init' );

/**
 * custom option and settings
 */
function booking_calendar_settings_init() {
	

}

/**
 * languages
 */
function booking_calendar_plugin_load_textdomain() {
    load_plugin_textdomain(
        'booking_calendar',
        false,
        dirname( plugin_basename( __FILE__ ) ) . '/languages'
    );
}