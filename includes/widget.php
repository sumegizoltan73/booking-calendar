<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class BookingCalendarPluginWidget extends WP_Widget {

    public function __construct() {

        parent::__construct(
            'booking_calendar_plugin_widget',
            __( 'Hotel Booking Calendar', 'booking-calendar-plugin' ),
            [
                'description' => __(
                    'Hotel Booking Calendar plugin widget',
                    'booking-calendar-plugin'
                ),
            ]
        );
    }

    public function widget( $args, $instance ) {

        echo $args['before_widget'];

        echo booking_calendar_plugin_render();

        echo $args['after_widget'];
    }

    public function form( $instance ) {

        echo '<p>' .
            esc_html__(
                'Ez a widget a shortcode renderelést használja.',
                'booking-calendar-plugin'
            ) .
        '</p>';
    }
}

add_action(
    'widgets_init',
    function () {
        register_widget( 'BookingCalendarPluginWidget' );
    }
);