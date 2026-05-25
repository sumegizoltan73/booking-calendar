
document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('agent-booking-admin-calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          locale: 'hu',
          headerToolbar: {
              center: 'dayGridMonth,timeGridWeek,dayGridDay' // buttons for switching between views
          },
          eventTimeFormat: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
          },
          events: async function(fetchInfo, successCallback) {
            const roomId = document.getElementById('room-id').value;

              const response = await fetch(
                  hotelBooking.restUrl + 'calendar-events?room_id=' + roomId
              );

              const data = await response.json();

              successCallback(data);
          },
          eventClick: async function(info) {

                let bookednote = "";
                let buttons = "";
                let bookings_html = "";
                if (info.event.extendedProps.status === 'BOOKED') {
                    const bookings = await getBookings(info.event.extendedProps.slot_id);
                    bookings_html = '<h3>Foglalás adatai</h3><ul>' + bookings.map((field, index) => {
                        return `<li>
                                    Ügyfél neve: ${field.extendedProps.customer_name}
                                    <br />
                                    Ügyfél Email: <a href="mailto:${field.extendedProps.customer_email}">${field.extendedProps.customer_email}</a>
                                    <br />
                                    Ügyfél Telefon: ${field.extendedProps.customer_phone}
                                    <br />
                                    Foglalás időpontja: ${field.created_at}
                                    <br />
                                    Státusz: ${field.extendedProps.status}
                                    <br />
                                    Bejegyzés készítője: ${field.extendedProps.created_by === null ? "VENDÉG" : field.extendedProps.created_by}
                                    
                                </li>`;
                    }).join('') + '</ul>';

                    const bookednotes = await getNotes(info.event.extendedProps.slot_id);
                    bookednote = '<h3>Megjegyzések</h3><ul>' + bookednotes.map((field, index) => {
                        return `<li>
                                    ${field.extendedProps.note}
                                </li>`;
                    }).join('') + '</ul>';
                }
                else {
                    buttons = `
                        <p>
                            <button onclick="updateSlot(${info.event.extendedProps.slot_id}, 'BLOCKED')">BLOCK</button>
                            <span style="margin-left: 20px;">&nbsp;</span>
                            <button onclick="updateSlot(${info.event.extendedProps.slot_id}, 'FREE')">FREE</button>
                        </p>
                    `;
                }
                Swal.fire({

                    title: 'Slot részletek',

                    html: `
                        <p>
                            ${info.event.start.toLocaleString()}
                        </p>
                        <p>
                            Ügynök:
                            ${info.event.extendedProps.name}
                        </p>
                        <p class="${info.event.extendedProps.status}" style="color: ${getSlotColor(info.event.extendedProps.status)};">
                            Status:
                            ${info.event.extendedProps.status}
                        </p>
                        ${bookings_html}
                        ${bookednote}
                        ${buttons}
                    `
                });
            }
        });
        calendar.render();
        window.hotelBookingCalendar = calendar;
      });

async function getNotes(slot_id) {
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-slot-notes?slot_id=' + slot_id
    );

    const data = await response.json();
    return data;
} 

async function getBookings(slot_id) {
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-slot-bookings?slot_id=' + slot_id
    );

    const data = await response.json();
    return data;
} 

async function generateSlots() {
    const url = hotelBooking.restUrl + 'generate-slots';
    const roomId = document.getElementById('room-id').value;
    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            },

            body: JSON.stringify({
                room_id: roomId
            })
        }
    );

    const data = await response.json();
    window.hotelBookingCalendar.refetchEvents();
    console.log(data);
}

async function generateUniqueSlots(room, 
    range,
    from,
    to,
    duration) {
    const url = hotelBooking.restUrl + 'generate-unique-slots';
    const roomId = document.getElementById('room-id').value;
    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            },

            body: JSON.stringify({
                room_id: room, 
                range,
                from,
                to,
                duration
            })
        }
    );

    const data = await response.json();
    window.hotelBookingCalendar.refetchEvents();
    console.log(data);
}

async function generateUniqueSlotsPopUp() {
    const room_select_html = document.getElementById('room-id').innerHTML;

    const { value: formValues } = await Swal.fire({

        title: 'Slot generálás',

        html: `
            <select id="agent-id-for-slot-generate">
                ${room_select_html}
            </select>
            <input
                id="slot-date-range"
                class="swal2-input"
            />

            <input
                id="time-from"
                type="time"
                class="swal2-input"
            />

            <input
                id="time-to"
                type="time"
                class="swal2-input"
            />

            <select id="slot-duration">
                <option value="1440">24 óra</option>
            </select>
        `,

        showCancelButton: true,
        allowEscapeKey: true,
        preConfirm: () => {
            const room = document.getElementById("room-id-for-slot-generate").value;
            const range = document.getElementById("slot-date-range").value;
            const from = document.getElementById("time-from").value;
            const to = document.getElementById("time-to").value;
            const duration = document.getElementById("slot-duration").value;

            const isValid = (range && from && to && from.length === 5 && to.length === 5);
            return [
                room, 
                range,
                from,
                to,
                duration,
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

    const [room, range, from, to, duration, isValid] = formValues;
    if (isValid) { 
        // generate
        generateUniqueSlots(room, 
            range,
            from,
            to,
            duration);
    }
    else {
        Swal.fire({
            title: 'Hiba!',
            text: 'Minden mezőt töltsön ki!',
            icon: 'error'
        });
    }
}

async function updateSlot(id, status) {

    const url =
        hotelBooking.restUrl +
        'update-slot-status';

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
                status: status
            })
        }
    );

    window.hotelBookingCalendar.refetchEvents();
    document.querySelector("button.swal2-confirm").click();
    const data = await response.json();

    console.log(data);
}

function getSlotColor(status) {

    switch(status) {

        case 'FREE':
            return '#4caf50';

        case 'BOOKED':
            return '#f44336';

        case 'BLOCKED':
            return '#9e9e9e';
    }
}

function refreshCalendar() {
    window.hotelBookingCalendar.refetchEvents();
}