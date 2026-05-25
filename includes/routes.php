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
        '/calendar-slot-notes',
        [
            'methods'  => 'GET',

            'callback' => 'booking_calendar_slot_notes'
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
}