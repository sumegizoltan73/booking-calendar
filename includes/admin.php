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

function get_rooms() {
    global $wpdb;
    
    $items = [];

    $table_rooms =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';

    $result = $wpdb->get_results(
        "
        SELECT
            *

        FROM
            {$table_rooms}

        ORDER BY id
        "
    );

    foreach ($result as $row) {

        $items[] = [
            'id' => intval($row->id),

            'room_no' => $row->room_no,

            'room_name' => $row->room_name,

            'capacity' => intval($row->capacity),

            'is_active' => intval($row->is_active)
        ];
    }

    return $items;
}

function booking_calendar_admin_page() {

    $admin_notice = "";

    $items = get_rooms();

    ?>

    <div class="wrap">

        <h1>Hotel Booking</h1>
        <h2>
            <?php if ($admin_notice != "") {
                    echo esc_html($admin_notice);
                }
            ?>
        </h2>
        <h2>Szobák</h2>
        <table>
            <thead>
                <tr>
                    <th>Szobaszám</th>
                    <th>Szoba név</th>
                    <th>Kapacitás</th>
                    <th>Foglalhatóság</th>
                    <th>Törlés</th>
                </tr>
            </thead>
            <tbody id="booking-calendar-rooms-repeater">
                <?php foreach ( $items as $item ) : ?>
                    <tr class="<?php echo intval($item['is_active']) == 1  ? 'active' : 'inactive'; ?>">
                        <td><?php echo $item['room_no'] ; ?></td>
                        <td><?php echo $item['room_name'] ; ?></td>
                        <td class="center"><?php echo $item['capacity'] ; ?></td>
                        <td><?php echo intval($item['is_active']) == 1  ? 'AKTÍV' : 'INAKTÍV'; ?></td>
                        <td><button type="button" class="button remove-item" onclick="removeRoom(event, <?php echo $item['id'] ; ?>)">–</button></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
            
        </table>

        <button type="button" class="button" id="add-item" onclick="addRoomPopUp()">+ Hozzáad</button>
        <br /><br />


        <h2>Kalendár</h2>
        <button id="generate-slots" class="button" onclick="generateBookingCalendarSlots()">
            Slotok generálása
        </button>

        <select id="room-id" onchange="refreshBookingCalendarCalendar()">
            <option
                value="0"
            >
                Minden szoba
            </option>
            <?php foreach ($items as $room): ?>

                <option
                    value="<?php echo esc_attr($room['id']); ?>"
                >
                    <?php
                    echo esc_html(
                        $room['room_no']
                    );
                    ?>
                </option>

            <?php endforeach; ?>
        </select>

        <button id="generate-unique-slots" class="button" onclick="generateUniqueBookingCalendarSlotsPopUp()">
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
        'booking_calendar_fullcalendar',
        plugin_dir_url(__FILE__) . '../assets/vendor/fullcalendar/index.global.min.js',
        [],
        '6.1.20',
        true
    );

    wp_enqueue_script(
        'booking_calendar_fullcalendar-locales',
        plugin_dir_url(__FILE__) . '../assets/vendor/fullcalendar/locales-all.global.min.js',
        ['booking_calendar_fullcalendar'],
        '6.1.20',
        true
    );

    wp_enqueue_script(
        'booking_calendar_sweetalert2',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        [],
        '11',
        true
    );

    wp_enqueue_script(
        'booking_calendar_momentjs',
        'https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js',
        [],
        '2.30.1',
        true
    );
    wp_enqueue_script(
        'booking_calendar_daterangepicker',
        'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js',
        ['jquery', 'booking_calendar_momentjs'],
        '3.1',
        true
    );
    wp_enqueue_style(
        'booking_calendar_daterangepicker-style',
        'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css',
        [],
        '3.1'
    );

    wp_enqueue_style(
        'booking_calendar_admin-style',
        plugin_dir_url(__FILE__) . '../assets/css/admin.css?nocache=' . date("Ymd_His"),
        [],
        '0.1.8'
    );

    wp_enqueue_style(
        'booking_calendar-style',
        plugin_dir_url(__FILE__) . '../assets/css/style.css?nocache=' . date("Ymd_His"),
        [],
        '0.1.8'
    );

    wp_enqueue_script(
        'booking-calendar-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin.js?nocache=' . date("Ymd_His"),
        ['booking_calendar_fullcalendar'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/admin.js'
        ),
        true
    );

    wp_enqueue_script(
        'booking-calendar-booking',
        plugin_dir_url(__FILE__) . '../assets/js/booking.js?nocache=' . date("Ymd_His"),
        ['booking_calendar_fullcalendar'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/booking.js'
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
