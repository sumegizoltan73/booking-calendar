<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Közös render függvény
 */
function booking_calendar_plugin_render( $atts = [] ) {

    booking_calendar_enqueue_assets();

    ob_start();
    ?>

    <div id="booking-calendar-calendar"></div>

    <?php

    return ob_get_clean();
}

function booking_calendar_enqueue_assets() {

    static $loaded = false;

    if ($loaded) {
        return;
    }

    $loaded = true;

    wp_enqueue_script(
        'fullcalendar',
        plugin_dir_url(__FILE__) . '../assets/vendor/fullcalendar/index.global.min.js',
        [],
        '6.1.20',
        true
    );

    wp_enqueue_script(
        'fullcalendar-locales',
        plugin_dir_url(__FILE__) . '../assets/vendor/fullcalendar/locales-all.global.min.js',
        ['fullcalendar'],
        '6.1.20',
        true
    );

    wp_enqueue_script(
        'sweetalert2',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        [],
        '11',
        true
    );

    wp_enqueue_script(
        'momentjs',
        'https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js',
        [],
        '2.30.1',
        true
    );
    wp_enqueue_script(
        'daterangepicker',
        'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js',
        ['jquery', 'momentjs'],
        '3.1',
        true
    );
    wp_enqueue_style(
        'daterangepicker-style',
        'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css',
        [],
        '3.1'
    );


    wp_enqueue_script(
        'booking-calendar-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin.js?nocache=' . date("Ymd_His"),
        array( 'wp-i18n', 'fullcalendar', 'jquery' ),
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/admin.js'
        ),
        true
    );

    wp_enqueue_script(
        'booking-calendar-booking-js',
        plugin_dir_url(__FILE__) . '../assets/js/booking.js?nocache=' . date("Ymd_His"),
        array( 'wp-i18n', 'booking-calendar-js' ),
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/booking.js'
        ),
        true
    );

    wp_enqueue_style(
        'booking_calendar_admin-style',
        plugin_dir_url(__FILE__) . '../assets/css/admin.css?nocache=' . date("Ymd_His"),
        [],
        '1.0'
    );

    wp_enqueue_style(
        'booking-calendar-style',
        plugin_dir_url(__FILE__) . '../assets/css/style.css?nocache=' . date("Ymd_His"),
        [],
        '1.0'
    );

    wp_localize_script(
        'booking-calendar-admin',
        'hotelBooking',
        [
            'nonce' => wp_create_nonce('wp_rest'),
            'restUrl' => rest_url(
                'booking-calendar/v1/'
            )
        ]
    );
    
    wp_localize_script(
        'booking-calendar-booking',
        'hotelBooking',
        [
            'nonce' => wp_create_nonce('wp_rest'),
            'restUrl' => rest_url(
                'booking-calendar/v1/'
            )
        ]
    );
}

/**
 * Shortcode regisztráció
 */
function booking_calendar_plugin_shortcode( $atts ) {
    return booking_calendar_plugin_render( $atts );
}

add_shortcode(
    'booking_calendar',
    'booking_calendar_plugin_shortcode'
);