<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action(
    'admin_menu',
    'booking_calendar_admin_menu'
);

function booking_calendar_admin_menu() {

    add_menu_page(
        'Hotel Booking',
        'Hotel Booking',
        'manage_options',
        'booking-calendar',
        'booking_calendar_admin_page',
        'dashicons-calendar-alt',
        30
    );
}

function booking_calendar_admin_page() {

    $admin_notice = "";

    $rooms = [];

    ?>

    <div class="wrap">

        <h1>Hotel Booking</h1>
        <h2>
            <?php if ($admin_notice != "") {
                    echo esc_html($admin_notice);
                }
            ?>
        </h2>
        <button id="generate-slots" onclick="generateSlots()">
            Slotok generálása
        </button>

        <select id="room-id" onchange="refreshCalendar()">
            <option
                value="0"
            >
                Minden szoba
            </option>
            <?php foreach ($rooms as $room): ?>

                <option
                    value="<?php echo esc_attr($room->ID); ?>"
                >
                    <?php
                    echo esc_html(
                        $room->display_name
                    );
                    ?>
                </option>

            <?php endforeach; ?>
        </select>

        <button id="generate-unique-slots" onclick="generateUniqueSlotsPopUp()">
            Egyedi Slotok generálása
        </button>

        <div id="booking-calendar-admin-calendar"></div>

    </div>

    <?php
}

add_action(
    'admin_enqueue_scripts',
    'booking_calendar_admin_assets'
);

function booking_calendar_admin_assets($hook) {

    if ($hook !== 'toplevel_page_booking-calendar') {
        return;
    }

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

    wp_enqueue_style(
        'admin-style',
        plugin_dir_url(__FILE__) . '../assets/css/admin.css?nocache=' . date("Ymd_His"),
        [],
        '0.1.4'
    );

    wp_enqueue_script(
        'booking-calendar-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin.js?nocache=' . date("Ymd_His"),
        ['fullcalendar'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/admin.js'
        ),
        true
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
}
