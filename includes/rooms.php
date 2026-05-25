<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function booking_calendar_add_room(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';
    $params =
    $request->get_json_params();

    $room_no = sanitize_text_field(
            $params['room_no']
        );
    $room_name = sanitize_text_field(
            $params['name']
        );
    $capacity = intval(sanitize_text_field(
            $params['capacity']
        ));
    $is_active = $params['is_active'];

    $result = $wpdb->insert(
        $table,
        [
            'room_no' => $room_no,

            'room_name' => $room_name,

            'capacity' => $capacity,

            'is_active' => $is_active ? 1 : 0,

            'created_at' =>
                current_time(
                    'mysql',
                    true
                )
        ]
    );

    if ($result === false) {
        error_log(
            'INSERT ERROR: ' . $wpdb->last_error
        );
    }
    return [
        'success' => true,
        'message' => 'Room added',
        'id' => $wpdb->insert_id
    ];
}

function booking_calendar_remove_room(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';
    $params =
    $request->get_json_params();

    $id = $params['id'];

    $wpdb->query(
        $wpdb->prepare(
            "
            DELETE FROM {$table}

            WHERE
                id = %d
            ",
            $id
        )
    );

    return [
        'success' => true,
        'message' => 'Room deleted'
    ];
}