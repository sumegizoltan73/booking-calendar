
async function bookingSlot(id) {
    const { value: formValues } = await Swal.fire({

        title: 'Időpont foglalás',

        html: `
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
        fireBooking(id, 
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

async function fireBooking(id, 
    name,
    email,
    phone,
    notes) {

    const url =
        agentBooking.restUrl +
        'booking-slot';

    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',

                'X-WP-Nonce':
                    agentBooking.nonce
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

    window.agentBookingCalendar.refetchEvents();
    const data = await response.json();

    console.log(data);
}