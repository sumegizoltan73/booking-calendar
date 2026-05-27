async function bookingCalendaerGetRooms(slot_id) {
    const response = await fetch(
                  hotelBooking.restUrl + 'calendar-slot-get_rooms?slot_id=' + slot_id
              );

    const data = await response.json();

    return data;
}

async function bookingBookingCalendarSlot(id, startDate) {
    const rooms = await bookingCalendaerGetRooms(id);
    let rooms_html = "";
    if (rooms) {
        rooms_html = '<div class="booking-calendar-rooms">' + rooms.map((field, index) => {
            return `
                <div 
                    class="booking-calendar booking-calendar-${field.status} 
                        booking-calendar-${field.is_active === 1 ? 'active' : 'inactive'}"
                    data-id="${field.id}"
                    data-capacity="${field.capacity}"
                >
                    ${field.room_no}
                </div>
            `;
        }).join('') + '</div>';
        rooms_html += `
            <input type="hidden" id="booking-calendar-selected" value="" /> 
            <div class="booking-calendar-info">Jelöljön ki szobaszámot foglaláshoz. Több szobát is megjelölhet.</div>
        `;
    }
    const { value: formValues } = await Swal.fire({

        title: 'Szoba foglalás',

        html: `
            ${rooms_html}
            <input
                id="slot-date-range"
                class="swal2-input"
            />
            <br />
            <span id="booking-calendar-range-error">&nbsp;</span>
            <br />
            <input
                id="bookings-name"
                type="text"
                placeholder="Név"
                class="swal2-input"
            />
            <input
                id="bookings-email"
                placeholder="Email"
                type="email"
                class="swal2-input"
            />

            <input
                id="bookings-phone"
                placeholder="Telefonszám"
                type="text"
                class="swal2-input"
            />
            <br />
            <span style="font-weight: bold; font-size: 1.1em;">Megjegyzés:</span>
            <textarea
                id="bookings-notes"
                class="swal2-input"
                col:"30"
                rows:"10"
            />
            
        `,

        showCancelButton: true,
        allowEscapeKey: true,
        preConfirm: () => {
            const name = document.getElementById("bookings-name").value;
            const email = document.getElementById("bookings-email").value;
            const phone = document.getElementById("bookings-phone").value;
            const notes = document.getElementById("bookings-notes").value;
            const booked_rooms = document.getElementById('booking-calendar-selected').value;
            const range = document.getElementById("slot-date-range").value;
            
            const isValid = (name && email && phone);
            return [
                name, 
                email,
                phone,
                notes,
                booked_rooms,
                range,
                isValid
            ]
        },
        didOpen: () => {
            const formatedStartDate = startDate.replace(' 0:00:00', '').replaceAll('. ', '-');
            jQuery('#slot-date-range')
                .daterangepicker({
                    locale: {
                        format: 'YYYY-MM-DD'
                    },
                    minDate: formatedStartDate,

                });
            jQuery('#slot-date-range').on('apply.daterangepicker', function(ev, picker) {
                const selected_startdate = picker.startDate.format('YYYY-MM-DD');
                jQuery('#slot-date-range').data('daterangepicker').setStartDate(formatedStartDate);
                const required_startdate = picker.startDate.format('YYYY-MM-DD');
                if (selected_startdate === required_startdate) {
                    jQuery('#booking-calendar-range-error').html('&nbsp;');}
                else { 
                    jQuery('#booking-calendar-range-error').html('A Slot kezdete kötelezően: ' + required_startdate);
                }
            });
            jQuery('.booking-calendar-FREE').on('click', function () {
                jQuery(this).toggleClass("selected");
                const selected_rooms = [];
                const selected_room_ids = [];
                jQuery('.booking-calendar.selected').each(function(index) {
                    selected_rooms.push(jQuery(this).text().trim());
                    selected_room_ids.push(jQuery(this).attr('data-id'));
                });
                document.getElementById('booking-calendar-selected').value = selected_room_ids.join(',');
                if (selected_rooms.length < 1) {
                    jQuery('.booking-calendar-info').html('Jelöljön ki szobaszámot foglaláshoz. Több szobát is megjelölhet.');
                }
                else {
                    jQuery('.booking-calendar-info').html('Foglalt szobák: ' + selected_rooms.join(','));
                }
            });
        }
    });

    if (formValues) {
        // if not cancel selected
        const [name, email, phone, notes, booked_rooms, range, isValid] = formValues;
        if (isValid) { 
            // generate
            fireBookingCalendarBooking(id, 
                name,
                email,
                phone,
                booked_rooms,
                notes,
                range
            );
        }
        else {
            Swal.fire({
                title: 'Hiba!',
                text: 'Minden mezőt töltsön ki!',
                icon: 'error'
            });
        }
    }
}

async function fireBookingCalendarBooking(id, 
    name,
    email,
    phone,
    booked_rooms,
    notes,
    range
) {

    const url =
        hotelBooking.restUrl +
        'booking-slot';

    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',

                'X-WP-Nonce':
                    hotelBooking.nonce
            },

            body: JSON.stringify({
                id: id,
                email,
                name,
                phone,
                notes,
                booked_rooms,
                range
            })
        }
    );

    window.hotelBookingCalendar.refetchEvents();
    const data = await response.json();

    console.log(data);
}