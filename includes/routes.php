<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action(
    'rest_api_init',
    'agent_booking_register_routes'
);

function agent_booking_register_routes() {

    register_rest_route(
        'agent-booking/v1',
        '/generate-slots',
        [
            'methods'  => 'POST',

            'callback' => 'agent_booking_generate_slots',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'agent-booking/v1',
        '/generate-unique-slots',
        [
            'methods'  => 'POST',

            'callback' => 'agent_booking_generate_unique_slots',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'agent-booking/v1',
        '/calendar-events',
        [
            'methods'  => 'GET',

            'callback' => 'agent_booking_calendar_events',

        ]
    );
    
    register_rest_route(
        'agent-booking/v1',
        '/update-slot-status',
        [
            'methods'  => 'POST',

            'callback' => 'agent_booking_update_slot_status',

            'permission_callback' => function () {

                return current_user_can(
                    'manage_options'
                );
            }
        ]
    );

    register_rest_route(
        'agent-booking/v1',
        '/booking-slot',
        [
            'methods'  => 'POST',

            'callback' => 'agent_booking_slot',

            'permission_callback' => function () {

                return true;
            }
        ]
    );

     register_rest_route(
        'agent-booking/v1',
        '/calendar-slot-notes',
        [
            'methods'  => 'GET',

            'callback' => 'agent_booking_slot_notes'
        ]
    );

     register_rest_route(
        'agent-booking/v1',
        '/calendar-slot-bookings',
        [
            'methods'  => 'GET',

            'callback' => 'agent_booking_slot_bookings'
        ]
    );
}