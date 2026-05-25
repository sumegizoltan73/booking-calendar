<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AgentBookingPluginWidget extends WP_Widget {

    public function __construct() {

        parent::__construct(
            'agent_booking_plugin_widget',
            __( 'Agent Booking Calendar', 'agent-booking-plugin' ),
            [
                'description' => __(
                    'Agent Booking plugin widget',
                    'agent-booking-plugin'
                ),
            ]
        );
    }

    public function widget( $args, $instance ) {

        echo $args['before_widget'];

        echo agent_booking_plugin_render();

        echo $args['after_widget'];
    }

    public function form( $instance ) {

        echo '<p>' .
            esc_html__(
                'Ez a widget a shortcode renderelést használja.',
                'agent-booking-plugin'
            ) .
        '</p>';
    }
}

add_action(
    'widgets_init',
    function () {
        register_widget( 'AgentBookingPluginWidget' );
    }
);