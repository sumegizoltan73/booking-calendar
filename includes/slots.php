<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function booking_calendar_generate_slots(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_slots';

    $start_date = new DateTime('today');

    
    for ($d = 0; $d < 7; $d++) {

        $date = clone $start_date;

        $date->modify("+{$d} day");

        $slot_start = clone $date;

        $slot_start->setTime(
            0,
            0
        );

        $slot_end = clone $slot_start;

        $slot_end->modify('+1440 minutes');     // 1 day

        $result = $wpdb->insert(
            $table,
            [
                'slot_start_utc' =>
                    $slot_start->format(
                        'Y-m-d H:i:s'
                    ),

                'slot_end_utc' =>
                    $slot_end->format(
                        'Y-m-d H:i:s'
                    ),

                'status' => 'FREE',

                //'max_bookings' => 1,

                'created_at' =>
                    current_time(
                        'mysql',
                        true
                    ),

                'updated_at' =>
                    current_time(
                        'mysql',
                        true
                    ),
            ]
        );

        if ($result === false) {
            error_log(
                'INSERT ERROR: ' . $wpdb->last_error
            );
        }
    }
    return [
        'success' => true,
        'message' => 'Slot generation completed'
    ];
}

function booking_calendar_generate_unique_slots(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $params = $request->get_json_params();

    $rooms = [];
    $room_id = intval($params['room_id']);

    $range = explode(" - ", $params['range']);
    
    $start_date = new DateTime(
        trim($range[0]),
        new DateTimeZone('UTC')
    );
    $end_date = new DateTime(
        trim($range[1]),
        new DateTimeZone('UTC')
    );
    $diff = date_diff($start_date, $end_date);
    $days = intval($diff->format("%a"));

    $duration = intval($params['duration']);

    // Delete all FREE slots within the interval
    $wpdb->query(
        $wpdb->prepare(
            "
            DELETE FROM {$table}

            WHERE
                status = 'FREE'

                AND slot_start_utc >= %s

                AND slot_start_utc <= %s
            ",
            $start_date->format('Y-m-d 00:00:00'),
            $end_date->format('Y-m-d 23:59:59')
        )
    );

    // Create new slots with FREE state
    for ($d = 0; $d <= $days; $d++) {

        $date = clone $start_date;

        $date->modify("+{$d} day");

        $slot_start = clone $date;

        $slot_start->setTime(
            0,
            0
        );

        $slot_end = clone $slot_start;

        $slot_end->modify('+' . $duration . ' minutes');

        $wpdb->query(
            $wpdb->prepare(
                "
                INSERT IGNORE INTO {$table}
                (
                    slot_start_utc,
                    slot_end_utc,
                    status,
                    created_at,
                    updated_at
                )

                VALUES (
                    %s,
                    %s,
                    %s,
                    NOW(),
                    NOW()
                )
                ",
                [
                    $slot_start->format(
                        'Y-m-d H:i:s'
                    ),
                    $slot_end->format(
                        'Y-m-d H:i:s'
                    ),
                    'FREE'
                ]
            )
        );
    }
    
    return [
        'success' => true,
        'message' => 'Unique Slot generation completed'
    ];
}
function booking_calendar_get_slot_color(
    $status
) {

    switch($status) {

        case 'FREE':
            return '#4caf50';

        case 'BOOKED':
            return '#f44336';

        case 'BLOCKED':
            return '#9e9e9e';
    }
}

function booking_calendar_get_monogram(
    $title
) {
    $monogram = '';
    $names = explode(' ', $title);
    foreach ($names as $name) {
        $monogram = $monogram . substr($name, 0, 1);
    }
    return $monogram;
}
function booking_calendar_calendar_events(
    WP_REST_Request $request
) {
    global $wpdb;
    $table =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $table_bookings =
        $wpdb->prefix . 'hotel_booking_bookings';

    $room_id = intval(
        $request->get_param(
            'room_id'
        )
    );

    $result = $wpdb->get_results(
        "
        SELECT
                    s.*,
                    'BLOCKED' as state,
                    DATEDIFF( s.slot_end_utc, s.slot_start_utc) as days
                FROM
                    {$table} s

                WHERE
                        s.slot_start_utc >= CURDATE()
                    AND s.status = 'BLOCKED'
        UNION ALL
        SELECT
                    s.*,
                    'FREE' as state,
                    DATEDIFF( s.slot_end_utc, s.slot_start_utc) as days
                FROM
                    {$table} s

                WHERE
                        s.slot_start_utc >= CURDATE()
                    AND s.status = 'FREE'
                    AND NOT EXISTS (
                        SELECT
                            b.id
                        FROM
                            {$table_bookings} b
                        WHERE 
                            b.slot_id = s.id
                    )
        UNION ALL
        SELECT
                    s.*,
                    'BOOKED' as state,
                    DATEDIFF( s.slot_end_utc, s.slot_start_utc) as days
                FROM
                    {$table} s

                WHERE
                        s.slot_start_utc >= CURDATE()
                    AND s.status = 'FREE'
                    AND EXISTS (
                        SELECT
                            b.id
                        FROM
                            {$table_bookings} b
                        WHERE 
                            b.slot_id = s.id
                    )

        ORDER BY
            slot_start_utc
        "
    );
    $events = [];

    foreach ($result as $row) {
        
        $rooms_str = '';
        if ($row->state == 'BOOKED' || $row->state == 'BLOCKED') {
            $items = booking_calendar_get_rooms_by_slot_id($row->id);
            $rooms = [];
            foreach ($items as $rooms_row) {
                if ($rooms_row['status'] == 'BOOKED') {
                    // If filtered by room_id, only show the event if the booked room is the filtered one
                    if ($room_id == 0 || $room_id == $rooms_row['id']) {
                        $rooms[] = $rooms_row['room_no'];
                    }
                }
            }
            $rooms_str = implode(',', $rooms);
        }

        
        $days = $row->days;

        $events[] = [
            'title' => $rooms_str,

            'start' => $row->slot_start_utc,

            'end' => $row->slot_end_utc,

            'color' => ($room_id != 0 && $rooms_str == '') ? '' :booking_calendar_get_slot_color(
                $row->state
            ),

            'extendedProps' => [
                'slot_id' => $row->id,
                'status' => $row->state,
                'end' => $row->slot_end_utc,
                'days' => $days,
                'in_blocked_status' => $row->status == 'BLOCKED' && $rooms_str != '' ? 'BOOKED' : 'FREE'
            ]
        ];
    }

    return $events;
}
function booking_calendar_update_slot_status(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $params =
        $request->get_json_params();

    $id =
        intval($params['id']);

    $status =
        sanitize_text_field(
            $params['status']
        );

    if ($status == 'FREE' || $status == 'BLOCKED') {
        $wpdb->query(
            "
            UPDATE {$table}
            SET status = '{$status}'
            WHERE id = {$id}
            "
        );

        return [
            'success' => true,
            'message' => 'Slot update complet'
        ];
    }
    else {
        return [
            'success' => false,
            'message' => 'Slot update unfinished'
        ];
    }
}

// booking rooms
function booking_calendar_slot(
    WP_REST_Request $request
) {

    global $wpdb;

    $table =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $table_bookings =
        $wpdb->prefix . 'hotel_booking_bookings';
    $table_notes =
        $wpdb->prefix . 'hotel_booking_notes';
    $table_mapping =
        $wpdb->prefix . 'hotel_booking_calendar_booking_rooms';
    $params =
        $request->get_json_params();

    $id = intval($params['id']);
    $email = sanitize_email(
            $params['email']
        );
    $name = sanitize_text_field(
            $params['name']
        );
    $phone = sanitize_text_field(
            $params['phone']
        );
    $notes = sanitize_text_field(
            $params['notes']
        );
    $booked_rooms = sanitize_text_field(
            $params['booked_rooms']
        );
    $rooms = explode(',', $booked_rooms);
    $raw_range = sanitize_text_field(
            $params['range']
        );
    $range = explode(" - ", $raw_range);
    
    $start_date = new DateTime(
        trim($range[0]),
        new DateTimeZone('UTC')
    );
    $end_date = new DateTime(
        trim($range[1]),
        new DateTimeZone('UTC')
    );
    $diff = date_diff($start_date, $end_date);
    $days = intval($diff->format("%a"));

    $base_slot = $wpdb->get_row(
        $wpdb->prepare(
            "
            SELECT slot_start_utc, slot_end_utc
            FROM {$table}
            WHERE id = %d
            ",
            $id
        )
    );

    $slot_ids = [];
    if ($base_slot) {
        $booking_start = new DateTime(
            $base_slot->slot_start_utc,
            new DateTimeZone('UTC')
        );
        $booking_end = clone $booking_start;
        $booking_end->modify("+{$days} day");

        if ($days > 0) {
            $booking_start_sql = $booking_start->format('Y-m-d H:i:s');

            $booking_end->modify('+ 23 hours');
            $booking_end->modify('+ 59 minutes');
            $booking_end_sql = $booking_end->format('Y-m-d H:i:s');

            $slot_id = $wpdb->get_var(
                $wpdb->prepare(
                    "
                    SELECT id
                    FROM {$table}
                    WHERE slot_start_utc = %s
                        AND slot_end_utc = %s
                    LIMIT 1
                    ",
                    $booking_start_sql,
                    $booking_end_sql
                )
            );

            if (!$slot_id) {
                $wpdb->query(
                    $wpdb->prepare(
                        "
                        INSERT INTO {$table}
                        (
                            slot_start_utc,
                            slot_end_utc,
                            status,
                            created_at,
                            updated_at
                        )
                        VALUES (
                            %s,
                            %s,
                            'FREE',
                            NOW(),
                            NOW()
                        )
                        ON DUPLICATE KEY UPDATE
                            slot_end_utc = IF(status = 'FREE', VALUES(slot_end_utc), slot_end_utc),
                            updated_at = IF(status = 'FREE', NOW(), updated_at)
                        ",
                        $booking_start_sql,
                        $booking_end_sql
                    )
                );

                $slot_id = $wpdb->get_var(
                    $wpdb->prepare(
                        "
                        SELECT id
                        FROM {$table}
                        WHERE slot_start_utc = %s
                            AND slot_end_utc = %s
                        LIMIT 1
                        ",
                        $booking_start_sql,
                        $booking_end_sql
                    )
                );
            }

            if ($slot_id) {
                $slot_ids = [intval($slot_id)];
            }
        } else {
            $slot_ids = $wpdb->get_col(
                $wpdb->prepare(
                    "
                    SELECT id
                    FROM {$table}
                    WHERE status = 'FREE'
                        AND slot_start_utc >= %s
                        AND slot_start_utc <= %s
                    ORDER BY slot_start_utc
                    ",
                    $booking_start->format('Y-m-d H:i:s'),
                    $booking_end->format('Y-m-d H:i:s')
                )
            );
        }
    }

    $current_user = wp_get_current_user();
    $created_id = null;
    $created_id_str = 'NULL';
    if ($current_user) {
        $created_id = $current_user->ID;
        $created_id_str = "{$created_id}";
    }

    foreach ($slot_ids as $slot_id) {
        $slot_id = intval($slot_id);

        $result = $wpdb->query(
            "
            INSERT INTO {$table_bookings} 
            (slot_id, customer_email, customer_name, customer_phone, created_by, created_at)
            SELECT id as slot_id, '{$email}' as customer_email, '{$name}' as customer_name, '{$phone}' as customer_phone, {$created_id_str} as created_by, NOW() as created_at 
            FROM {$table} s
            WHERE s.id = {$slot_id} AND s.status = 'FREE'
            "
        );

        if ($result === false) {

            error_log($wpdb->last_error);

        } else {

            $booking_id = $wpdb->insert_id;

            if ($booking_id > 0) {
                if ($notes != "") {
                    $wpdb->query(
                        "
                        INSERT INTO {$table_notes}
                        (booking_id, author_user_id, note_type, visibility, note, created_at)
                        VALUES ({$booking_id}, {$created_id_str}, 'COSTUMER', 'AGENT', '{$notes}', NOW())
                        "
                    );
                }

                // Insert SYSTEM note for more then 1 day booking
                if ($days > 0) {
                    $wpdb->query(
                        "
                        INSERT INTO {$table_notes}
                        (booking_id, author_user_id, note_type, visibility, note, created_at)
                        VALUES ({$booking_id}, {$created_id_str}, 'SYSTEM', 'AGENT', 'Több napos foglalás: {$start_date->format('Y-m-d')} - {$end_date->format('Y-m-d')}', NOW())
                        "
                    );
                }

                foreach ($rooms as $room) { 
                    $result = $wpdb->insert(
                        $table_mapping,
                        [
                            'slot_id' => $slot_id,

                            'booking_id' => $booking_id,

                            'room_id' => intval($room),

                            'created_at' =>
                                current_time(
                                    'mysql',
                                    true
                                ),
                        ]
                    );

                    if ($result === false) {
                        error_log(
                            'INSERT ERROR: ' . $wpdb->last_error
                        );
                    }
                }
            }
        }
    }

    return [
        'success' => true,
        'message' => 'Slot update complet'
    ];
}

function booking_calendar_slot_notes(
    WP_REST_Request $request
) {
    global $wpdb;
    $table_slots =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $table_bookings =
        $wpdb->prefix . 'hotel_booking_bookings';
    $table_notes =
        $wpdb->prefix . 'hotel_booking_notes';
    $usertable =
        $wpdb->prefix . 'users';

    $slot_id = intval(
        $request->get_param(
            'slot_id'
        )
    );

    $result = $wpdb->get_results(
        $wpdb->prepare(
            "
            SELECT
                n.note,
                n.note_type,
                n.visibility,
                n.created_at,
                u.ID as author_user_id,
                u.display_name,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.status

            FROM
                {$table_notes} n

            JOIN
                {$table_bookings} b
                ON b.ID = n.booking_id
            JOIN
                {$table_slots} s 
                ON b.slot_id = s.id
            LEFT JOIN
                {$usertable} u
                ON n.author_user_id = u.ID

            WHERE
                b.slot_id = %d

            ORDER BY
                n.created_at
            ",
            $slot_id
        )
    );
    $notes = [];

    foreach ($result as $row) {

        $notes[] = [
            'author_monogram' => booking_calendar_get_monogram($row->display_name),

            'customer_monogram' => booking_calendar_get_monogram($row->customer_name),

            'created_at' => $row->created_at,

            'extendedProps' => [
                'slot_id' => $slot_id,
                'note_type' => $row->note_type,
                'author_name' => $row->display_name,
                'author_user_id' => $row->author_user_id,
                'customer_name' => $row->customer_name,
                'visibility' => $row->visibility,
                'note' => $row->note
            ]
        ];
    }

    return $notes;
}

function booking_calendar_slot_bookings(
    WP_REST_Request $request
) {
    global $wpdb;
    $table_slots =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $table_bookings =
        $wpdb->prefix . 'hotel_booking_bookings';
    $table_mappings =
        $wpdb->prefix . 'hotel_booking_calendar_booking_rooms';
    $table_rooms =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';
    $usertable =
        $wpdb->prefix . 'users';

    $slot_id = intval(
        $request->get_param(
            'slot_id'
        )
    );

    $result = $wpdb->get_results(
        $wpdb->prepare(
            "
            SELECT
                b.created_at,
                u.ID as booked_user_id,
                u.display_name,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.status,
                b.id

            FROM
                {$table_bookings} b
            JOIN
                {$table_slots} s 
                ON b.slot_id = s.id
            LEFT JOIN
                {$usertable} u
                ON b.created_by = u.ID

            WHERE
                b.slot_id = %d
            ",
            $slot_id
        )
    );
    $bookings = [];

    foreach ($result as $row) {

        $rooms_result = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT
                    m.created_at,
                    r.room_no,
                    r.room_name,
                    r.capacity,
                    r.is_active,
                    r.id as room_id

                FROM
                    {$table_mappings} m
                JOIN
                    {$table_rooms} r
                    ON m.room_id = r.id

                WHERE
                    m.booking_id = %d
                ",
                $row->id
            )
        );
        $rooms = [];
        foreach ($rooms_result as $rooms_row) {
            $rooms[] = $rooms_row->room_no;
        }
        $rooms_str = implode(',', $rooms);

        $bookings[] = [
            'created_at' => $row->created_at,

            'extendedProps' => [
                'slot_id' => $slot_id,
                'booking_id' => $row->id,
                'status' => $row->status,
                'rooms' => $rooms_str,
                'customer_name' => $row->customer_name,
                'customer_monogram' => booking_calendar_get_monogram($row->customer_name),
                'customer_email' => $row->customer_email,
                'customer_phone' => $row->customer_phone,
                'created_by' => $row->display_name
            ]
        ];
    }

    return $bookings;
}

function booking_calendar_day_bookings(
    WP_REST_Request $request
) {
    global $wpdb;
    $table_slots =
        $wpdb->prefix . 'hotel_booking_calendar_slots';
    $table_bookings =
        $wpdb->prefix . 'hotel_booking_bookings';
    $table_mappings =
        $wpdb->prefix . 'hotel_booking_calendar_booking_rooms';
    $table_rooms =
        $wpdb->prefix . 'hotel_booking_calendar_rooms';
    $usertable =
        $wpdb->prefix . 'users';

    $date = sanitize_text_field(
        $request->get_param(
            'date'
        )
    );
    $exclude_slot_id = intval(
        $request->get_param(
            'exclude_slot_id'
        )
    );

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return [];
    }

    $day_start = $date . ' 00:00:00';
    $day_end = gmdate(
        'Y-m-d H:i:s',
        strtotime($day_start . ' +1 day')
    );

    $result = $wpdb->get_results(
        $wpdb->prepare(
            "
            SELECT
                b.created_at,
                b.slot_id,
                u.display_name,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.status,
                b.id,
                GROUP_CONCAT(r.room_no ORDER BY r.room_no SEPARATOR ',') as rooms

            FROM
                {$table_bookings} b
            JOIN
                {$table_slots} s
                ON b.slot_id = s.id
            LEFT JOIN
                {$usertable} u
                ON b.created_by = u.ID
            LEFT JOIN
                {$table_mappings} m
                ON m.booking_id = b.id
            LEFT JOIN
                {$table_rooms} r
                ON m.room_id = r.id

            WHERE
                s.slot_start_utc < %s
                AND s.slot_end_utc > %s
                AND (%d = 0 OR b.slot_id <> %d)

            GROUP BY
                b.id,
                b.created_at,
                b.slot_id,
                u.display_name,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.status

            ORDER BY
                s.slot_start_utc,
                b.created_at
            ",
            $day_end,
            $day_start,
            $exclude_slot_id,
            $exclude_slot_id
        )
    );
    $bookings = [];

    foreach ($result as $row) {

        $bookings[] = [
            'created_at' => $row->created_at,

            'extendedProps' => [
                'slot_id' => intval($row->slot_id),
                'booking_id' => $row->id,
                'status' => $row->status,
                'rooms' => $row->rooms,
                'customer_name' => $row->customer_name,
                'customer_monogram' => booking_calendar_get_monogram($row->customer_name),
                'customer_email' => $row->customer_email,
                'customer_phone' => $row->customer_phone,
                'created_by' => $row->display_name
            ]
        ];
    }

    return $bookings;
}
