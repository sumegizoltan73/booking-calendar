<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function agent_booking_create_roles() {

    add_role(
        'booking_agent',
        'Booking Agent',
        [
            'read' => true,
            'manage_agent_booking' => true
        ]
    );
}