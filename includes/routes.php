<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action(
    'rest_api_init',
    'booking_calendar_register_routes'
);

function booking_calendar_register_routes() {

    register_rest_route(
        'booking-calendar/v1',
        '/generate-slots',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_generate_slots',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/generate-unique-slots',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_generate_unique_slots',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/calendar-events',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_calendar_events',

        ]
    );
    
    register_rest_route(
        'booking-calendar/v1',
        '/update-slot-status',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_update_slot_status',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/booking-slot',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_slot',

            'permission_callback' => function () {

                return true;
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/add-booking-note',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_add_booking_note',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/add-calendar-slot-note',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_add_slot_note',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/delete-booking',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_delete_booking',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

     register_rest_route(
        'booking-calendar/v1',
        '/calendar-slot-notes',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_slot_notes'
        ]
    );

     register_rest_route(
        'booking-calendar/v1',
        '/calendar-slot-own-notes',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_slot_own_notes'
        ]
    );

     register_rest_route(
        'booking-calendar/v1',
        '/calendar-slot-bookings',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_slot_bookings'
        ]
    );

     register_rest_route(
        'booking-calendar/v1',
        '/calendar-day-bookings',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_day_bookings'
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/remove-room',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_remove_room',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/add-room',
        [
            'methods'  => 'POST',

            'callback' => 'booking_calendar_add_room',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/calendar-slot-get_rooms',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_get_rooms_for_a_day'
        ]
    );
    
    register_rest_route(
        'booking-calendar/v1',
        '/calendar-slot-get_rooms_by_slot_id',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_get_rooms_for_slot'
        ]
    );

    register_rest_route(
        'booking-calendar/v1',
        '/booking-search-results',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_booking_search_results'
        ]
    );
}
