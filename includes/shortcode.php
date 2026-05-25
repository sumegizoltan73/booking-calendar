<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Közös render függvény
 */
function agent_booking_plugin_render( $atts = [] ) {

    agent_booking_enqueue_assets();

    ob_start();
    ?>

    <div id="agent-booking-calendar"></div>

    <?php

    return ob_get_clean();
}

function agent_booking_enqueue_assets() {

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
        'agent-calendar-js',
        plugin_dir_url(__FILE__) . '../assets/js/calendar.js?nocache=' . date("Ymd_His"),
        ['fullcalendar'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/calendar.js'
        ),
        true
    );

    wp_enqueue_script(
        'agent-booking-js',
        plugin_dir_url(__FILE__) . '../assets/js/booking.js?nocache=' . date("Ymd_His"),
        ['agent-calendar-js'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/booking.js'
        ),
        true
    );

    wp_enqueue_style(
        'agent-booking-style',
        plugin_dir_url(__FILE__) . '../assets/css/style.css?nocache=' . date("Ymd_His"),
        [],
        '1.0'
    );

    wp_localize_script(
        'agent-booking-js',
        'agentBooking',
        [
            'nonce' => wp_create_nonce('wp_rest'),
            'restUrl' => rest_url(
                'agent-booking/v1/'
            )
        ]
    );
    wp_localize_script(
        'agent-calendar-js',
        'agentBooking',
        [
            'nonce' => wp_create_nonce('wp_rest'),
            'restUrl' => rest_url(
                'agent-booking/v1/'
            )
        ]
    );
}

/**
 * Shortcode regisztráció
 */
function agent_booking_plugin_shortcode( $atts ) {
    return agent_booking_plugin_render( $atts );
}

add_shortcode(
    'agent_booking_calendar',
    'agent_booking_plugin_shortcode'
);