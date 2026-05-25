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

function booking_calendar_get_rooms_for_slot(
    WP_REST_Request $request
) {
    global $wpdb;
    
    $items = [];

    $table_rooms =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';
    $table_mapping =
        $wpdb->prefix . 'hotel_booking_calendar_booking_rooms';
    
    $slot_id = intval($request->get_param(
            'slot_id'
        )
    );
    
    $result = $wpdb->get_results(
        "
        SELECT
            'FREE' as status,
            r.id,
            r.room_no,
            r.is_active,
            r.capacity,
            {$slot_id} as slot_id
        FROM
            {$table_rooms} r
        WHERE
            NOT EXISTS (
                SELECT 
                    m.slot_id
                FROM 
                    {$table_mapping} m
                WHERE
                    m.room_id = r.id AND m.slot_id = {$slot_id}
            )
        UNION ALL
        SELECT
            'BOOKED' as status,
            r.id,
            r.room_no,
            r.is_active,
            r.capacity,
            {$slot_id} as slot_id
        FROM
            {$table_rooms} r
        JOIN 
            {$table_mapping} m
            ON m.room_id = r.id AND m.slot_id = {$slot_id}
        ORDER BY status, id
        "
    );

    foreach ($result as $row) {

        $items[] = [
            'id' => intval($row->id),

            'room_no' => $row->room_no,

            'status' => $row->status,

            'capacity' => intval($row->capacity),

            'is_active' => intval($row->is_active),

            'slot_id' => intval($row->slot_id),

            'color' => booking_calendar_get_slot_color($row->status)
        ];
    }

    return $items;
}