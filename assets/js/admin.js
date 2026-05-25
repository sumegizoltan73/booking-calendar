
document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('booking-calendar-admin-calendar');
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
                        <p class="${info.event.extendedProps.status}" style="color: ${getBookingCalendarSlotColor(info.event.extendedProps.status)};">
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

function getBookingCalendarSlotColor(status) {

    switch(status) {

        case 'FREE':
            return '#4caf50';

        case 'BOOKED':
            return '#f44336';

        case 'BLOCKED':
            return '#9e9e9e';
    }
}

async function removeRoom(e, id) {
    const url =
        hotelBooking.restUrl +
        'remove-room';

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
                id: id
            })
        }
    );

    const data = await response.json();

    console.log(data);
    if (e.target.classList.contains('remove-item')) {
        e.target.parentElement.parentElement.remove();
    }

}

async function addRoom(room_no, 
    name,
    capacity,
    is_active) {
    const url =
        hotelBooking.restUrl +
        'add-room';

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
                room_no, 
                name,
                capacity,
                is_active
            })
        }
    );

    const data = await response.json();

    console.log(data);

    if (data.id) {
        const html = `
            <tr class="${is_active ? 'active' : 'inactive'}">
                <td>${room_no}</td>
                <td>${name}</td>
                <td class="center">${capacity}</td>
                <td>${is_active ? 'AKTÍV' : 'INAKTÍV'}</td>
                <td><button type="button" class="button remove-item" onclick="removeRoom(event, ${data.id})">–</button></td>
            </tr>
        `;
        let container = document.getElementById('booking-calendar-rooms-repeater');
        container.insertAdjacentHTML('beforeend', html);
    }
}

async function addRoomPopUp() {
    const room_no_str = "Szobaszám";
    const name_str = "Szoba neve";
    const capacity_str = "Kapacitás";
    const is_active_str = "Aktív";

    const { value: formValues } = await Swal.fire({

        title: 'Szoba hozzáadása',

        html: `
            <div class="booking-calendar-item">
                <input type="text"
                    id="booking-calendar_room_no"
                    value=""
                    placeholder="${room_no_str}" />

                <input type="text"
                    id="booking-calendar_room_name"
                    value=""
                    placeholder="${name_str}" />

                <input type="number"
                    id="booking-calendar_capacity"
                    value=""
                    placeholder="${capacity_str}" />

                <input type="checkbox"
                    id="booking-calendar_is_active"
                    checked />
                <span>${is_active_str}</span>
            </div>
        `,

        showCancelButton: true,
        allowEscapeKey: true,
        preConfirm: () => {
            const room_no = document.getElementById("booking-calendar_room_no").value;
            const name = document.getElementById("booking-calendar_room_name").value;
            const capacity = document.getElementById("booking-calendar_capacity").value;
            const is_active = document.getElementById("booking-calendar_is_active").checked;

            const isValid = (room_no && name && capacity);
            return [
                room_no, 
                name,
                capacity,
                is_active,
                isValid
            ]
        },
        didOpen: () => {

        }
    });

    const [room_no, name, capacity, is_active, isValid] = formValues;
    if (isValid) { 
        // generate
        addRoom(room_no, 
            name,
            capacity,
            is_active);
    }
    else {
        Swal.fire({
            title: 'Hiba!',
            text: 'Minden mezőt töltsön ki!',
            icon: 'error'
        });
    }
}
