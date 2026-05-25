<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action(
    'admin_menu',
    'agent_booking_admin_menu'
);

function agent_booking_admin_menu() {

    add_menu_page(
        'Agent Booking',
        'Agent Booking',
        'manage_options',
        'agent-booking',
        'agent_booking_admin_page',
        'dashicons-calendar-alt',
        30
    );
}

function agent_booking_admin_page() {

    $admin_notice = "";
    if (!class_exists('Groups_User')) {
        $admin_notice = "Groups plugin required";
    }

    $users = get_users();
    $agents = [];
    foreach ($users as $user) {
        $group_user = new Groups_User($user->ID);
        foreach ($group_user->__get('groups') as $group) {
            if ($group->name == 'booking_agent') {
                $agents[] = $user;
                break;
            }
        }
    }

    ?>

    <div class="wrap">

        <h1>Agent Booking</h1>
        <h2>
            <?php if ($admin_notice != "") {
                    echo esc_html($admin_notice);
                }
            ?>
        </h2>
        <button id="generate-slots" onclick="generateSlots()">
            Slotok generálása
        </button>

        <select id="agent-id" onchange="refreshCalendar()">
            <option
                value="0"
            >
                Minden ügynök
            </option>
            <?php foreach ($agents as $agent): ?>

                <option
                    value="<?php echo esc_attr($agent->ID); ?>"
                >
                    <?php
                    echo esc_html(
                        $agent->display_name
                    );
                    ?>
                </option>

            <?php endforeach; ?>
        </select>

        <button id="generate-unique-slots" onclick="generateUniqueSlotsPopUp()">
            Egyedi Slotok generálása
        </button>

        <div id="agent-booking-admin-calendar"></div>

    </div>

    <?php
}

add_action(
    'admin_enqueue_scripts',
    'agent_booking_admin_assets'
);

function agent_booking_admin_assets($hook) {

    if ($hook !== 'toplevel_page_agent-booking') {
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
        'agent-booking-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin.js?nocache=' . date("Ymd_His"),
        ['fullcalendar'],
        filemtime(
            plugin_dir_path(__FILE__) .
            '../assets/js/admin.js'
        ),
        true
    );

    wp_localize_script(
        'agent-booking-admin',
        'agentBooking',
        [
            'nonce' => wp_create_nonce('wp_rest'),
            'restUrl' => rest_url(
                'agent-booking/v1/'
            )
        ]
    );
}
