async function bookingCalendaerGetRooms(slot_id) {
    const response = await fetch(
                  hotelBooking.restUrl + 'calendar-slot-get_rooms?slot_id=' + slot_id
              );

    const data = await response.json();

    return data;
}

async function bookingBookingCalendarSlot(id) {
    const rooms = await bookingCalendaerGetRooms(id);
    let rooms_html = "";
    if (rooms) {
        rooms_html = '<div class="booking-calendar-rooms">' + rooms.map((field, index) => {
            return `
                <div 
                    class="booking-calendar-${field.status} 
                        booking-calendar-${field.is_active === 1 ? 'active' : 'inactive'}"
                    data-id="${field.id}"
                    data-capacity="${field.capacity}"
                >
                    ${field.room_no}
                </div>
            `;
        }).join('') + '</div>';
    }
    const { value: formValues } = await Swal.fire({

        title: 'Szoba foglalás',

        html: `
            ${rooms_html}
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
            <textarea
                id="bookings-notes"
                placeholder="Megjegyzés"
                class="swal2-input"
            />
            
        `,

        showCancelButton: true,
        allowEscapeKey: true,
        preConfirm: () => {
            const name = document.getElementById("bookings-name").value;
            const email = document.getElementById("bookings-email").value;
            const phone = document.getElementById("bookings-phone").value;
            const notes = document.getElementById("bookings-notes").value;

            const isValid = (name && email && phone);
            return [
                name, 
                email,
                phone,
                notes,
                isValid
            ]
        },
        didOpen: () => {

            jQuery('#slot-date-range')
                .daterangepicker({
                    locale: {
                        format: 'YYYY-MM-DD'
                    }
                });
        }
    });

    const [name, email, phone, notes, isValid] = formValues;
    if (isValid) { 
        // generate
        fireBookingCalendarBooking(id, 
            name,
            email,
            phone,
            notes);
    }
    else {
        Swal.fire({
            title: 'Hiba!',
            text: 'Minden mezőt töltsön ki!',
            icon: 'error'
        });
    }
    
}

async function fireBookingCalendarBooking(id, 
    name,
    email,
    phone,
    notes) {

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
                notes
            })
        }
    );

    window.hotelBookingCalendar.refetchEvents();
    const data = await response.json();

    console.log(data);
}