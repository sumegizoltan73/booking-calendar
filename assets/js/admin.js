
document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('booking-calendar-admin-calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          locale: 'hu',
          headerToolbar: {
              center: 'multiMonthYear,dayGridMonth,timeGridWeek,dayGridDay' // buttons for switching between views
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
          eventDidMount: function(info) {
            addBookingCalendarEventTooltip(info);
          },
          eventClick: async function(info) {

                let bookednote = "";
                let buttons = "";
                let bookings_html = "";
                if (info.event.extendedProps.status === 'BOOKED' || info.event.extendedProps.in_blocked_status === 'BOOKED') {
                    
                    const canManageBookingActions = info.event.extendedProps.status !== 'BLOCKED'
                        || info.event.extendedProps.in_blocked_status === 'BOOKED';
                    const bookings = await getBookingCalendarBookings(info.event.extendedProps.slot_id);
                    bookings_html = `
                        <h3>Foglalások adatai</h3>
                        <table class="booking-calendar-details">
                            <thead>
                                <tr>
                                    <th>Név</th>
                                    <th>Telefonszám</th>
                                    <th style="width: 33%;">Szobák</th>
                                    <th>Info</th>
                                    <th>+M</th>
                                    <th>Törlés</th>
                                </tr>
                            </thead>
                            <tbody>
                        ` + bookings.map((field, index) => {
                        return `<tr>
                                    <td>${field.extendedProps.customer_name}</td>
                                    <td>${field.extendedProps.customer_phone}</td>
                                    <td>${field.extendedProps.rooms}</td>
                                    <td 
                                        data-monogram="${escapeBookingCalendarHtml(field.extendedProps.customer_monogram)}"
                                        data-customer_email="${escapeBookingCalendarHtml(field.extendedProps.customer_email)}"
                                        data-created_at="${escapeBookingCalendarHtml(field.created_at)}"
                                        data-created_by="${escapeBookingCalendarHtml(field.extendedProps.created_by)}"
                                    ><button type="button" onclick="toggleBookingCalendarBookingDetails(this)"> i </button></td>
                                    <td>${canManageBookingActions ? `<button type="button" onclick="addBookingCalendarNote(${field.extendedProps.booking_id})">+M</button>` : ''}</td>
                                    <td>${canManageBookingActions ? `<button type="button" onclick="deleteBookingCalendarBooking(${field.extendedProps.booking_id})">Törlés</button>` : ''}</td>
                                </tr>`;
                    }).join('') + '</tbody></table>';

                    const bookednotes = await getBookingCalendarNotes(info.event.extendedProps.slot_id);
                    bookednote = `
                        <h3>Megjegyzések</h3>
                        <table class="booking-calendar-notes">
                            <thead>
                                <tr>
                                    <th>Monogram</th>
                                    <th style="width: 73%;">Megjegyzés</th>
                                    <th>Info</th>
                                </tr>
                            </thead>
                            <tbody>
                    ` + bookednotes.map((field, index) => {
                        return `<tr>
                                    <td>${field.customer_monogram}</td>
                                    <td>${field.extendedProps.note}</td>
                                    <td
                                        data-created_at="${escapeBookingCalendarHtml(field.created_at)}"
                                        data-author_name="${escapeBookingCalendarHtml(field.extendedProps.author_name)}"
                                        data-customer_name="${escapeBookingCalendarHtml(field.extendedProps.customer_name)}"
                                        data-note_type="${escapeBookingCalendarHtml(field.extendedProps.note_type)}"
                                        data-visibility="${escapeBookingCalendarHtml(field.extendedProps.visibility)}"
                                    ><button type="button" onclick="toggleBookingCalendarBookingDetails(this)"> i </button></td>
                                </tr>`;
                    }).join('') + '</tbody></table>';
                }
                let booking_button = "";
                if (info.event.extendedProps.status !== 'BLOCKED') {
                    booking_button = `
                        <span style="margin-left: 20px;">&nbsp;</span>
                        <button class="button" onclick="bookingBookingCalendarSlot(${info.event.extendedProps.slot_id}, '${info.event.start.toLocaleString()}')">FOGLALÁS</button>
                    `;
                }
                buttons = `
                    <p>
                        <button class="button" onclick="updateBookingCalendarSlot(${info.event.extendedProps.slot_id}, 'BLOCKED')">BLOCK</button>
                        <span style="margin-left: 20px;">&nbsp;</span>
                        <button class="button" onclick="updateBookingCalendarSlot(${info.event.extendedProps.slot_id}, 'FREE')">FREE</button>
                        ${booking_button}
                    </p>
                `;

                const dayBookings = await getBookingCalendarDayBookings(
                    getBookingCalendarDateString(info.event.start),
                    info.event.extendedProps.slot_id
                );
                const day_bookings_html = renderBookingCalendarDayBookings(dayBookings);

                const slotEnd = info.event.extendedProps.days > 1 ? ' - ' + info.event.extendedProps.end.toLocaleString().replace(' 00:00:00', '').replace(' 23:59:00', '').replaceAll('-', '. ') + '.' : '';
                Swal.fire({

                    title: 'Slot részletek',

                    html: `
                        <p>
                            ${info.event.start.toLocaleString().replace(' 0:00:00', '')}${slotEnd}
                        </p>
                        <p class="${info.event.extendedProps.status}" style="color: ${getBookingCalendarSlotColor(info.event.extendedProps.status)};">
                            Status:
                            ${info.event.extendedProps.status}
                        </p>
                        ${bookings_html}
                        ${day_bookings_html}
                        ${bookednote}
                        ${buttons}
                    `
                });
            },
            dateClick: function(info) {
                alert('Clicked on: ' + info.dateStr);
                //info.dayEl.style.backgroundColor = 'red';
            }
        });
        calendar.render();
        window.hotelBookingCalendar = calendar;
      });

const bookingCalendarTooltipCache = new Map();

function addBookingCalendarEventTooltip(info) {
    const slotId = info.event.extendedProps.slot_id;
    let tooltip = null;

    info.el.title = getBookingCalendarEventTooltipText(info.event);

    const removeTooltip = () => {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    };

    const positionTooltip = (event) => {
        if (!tooltip) {
            return;
        }

        tooltip.style.left = (event.pageX + 12) + 'px';
        tooltip.style.top = (event.pageY + 12) + 'px';
    };

    info.el.addEventListener('mouseenter', async function(event) {
        if (!slotId) {
            return;
        }

        const details = await getBookingCalendarEventTooltipDetails(info.event);

        if (!info.el.matches(':hover')) {
            return;
        }

        tooltip = renderBookingCalendarEventTooltip(details);
        document.body.appendChild(tooltip);
        positionTooltip(event);
    });

    info.el.addEventListener('mousemove', positionTooltip);
    info.el.addEventListener('mouseleave', removeTooltip);
}

function getBookingCalendarEventTooltipText(event) {
    const parts = [];

    if (event.title) {
        parts.push(event.title);
    }

    if (event.extendedProps.status) {
        parts.push('Status: ' + event.extendedProps.status);
    }

    return parts.join('\n');
}

async function getBookingCalendarEventTooltipDetails(event) {
    const slotId = event.extendedProps.slot_id;
    const hasBookingDetails = event.extendedProps.status === 'BOOKED'
        || event.extendedProps.in_blocked_status === 'BOOKED';

    if (!hasBookingDetails) {
        return {
            title: event.title,
            status: event.extendedProps.status,
            bookings: [],
            notes: []
        };
    }

    if (!bookingCalendarTooltipCache.has(slotId)) {
        bookingCalendarTooltipCache.set(slotId, Promise.all([
            getBookingCalendarBookings(slotId),
            getBookingCalendarNotes(slotId)
        ]));
    }

    const [bookings, notes] = await bookingCalendarTooltipCache.get(slotId);

    return {
        title: event.title,
        status: event.extendedProps.status,
        bookings,
        notes
    };
}

function renderBookingCalendarEventTooltip(details) {
    const tooltip = document.createElement('div');
    tooltip.className = 'booking-calendar-event-tooltip';
    tooltip.style.cssText = [
        'position:absolute',
        'z-index:99999',
        'max-width:320px',
        'padding:8px 10px',
        'background:#222',
        'color:#fff',
        'border-radius:4px',
        'box-shadow:0 2px 8px rgba(0,0,0,.25)',
        'font-size:12px',
        'line-height:1.4',
        'pointer-events:none'
    ].join(';');

    appendBookingCalendarTooltipLine(tooltip, 'Title', details.title);
    appendBookingCalendarTooltipLine(tooltip, 'Status', details.status);

    details.bookings.forEach((booking) => {
        appendBookingCalendarTooltipLine(
            tooltip,
            'Customer',
            booking.extendedProps.customer_monogram + ' (' + booking.extendedProps.rooms + ')' + ' - ' + booking.extendedProps.customer_name,
            true, 
            false
        );
        appendBookingCalendarTooltipLine(
            tooltip,
            'Phone',
            booking.extendedProps.customer_phone,
            false,
            true
        );
    });

    const notes = details.notes
        .map((note) => note.customer_monogram + ' - ' + note.extendedProps.note)
        .filter(Boolean);

    if (notes.length) {
        const label = document.createElement('div');
        label.textContent = 'Notes:';
        label.style.fontWeight = '700';
        label.style.marginTop = '4px';
        tooltip.appendChild(label);

        const list = document.createElement('ul');
        list.style.margin = '2px 0 0 16px';
        list.style.padding = '0';

        notes.forEach((note) => {
            const item = document.createElement('li');
            item.textContent = note;
            item.style.borderBottom = '1px solid rgba(255,255,255,0.25)';
            item.style.padding = '4px 0';
            list.appendChild(item);
        });

        tooltip.appendChild(list);
    }

    return tooltip;
}

function appendBookingCalendarTooltipLine(container, label, value, isBorderTop, isBorderBottom) {
    if (!value) {
        return;
    }

    const line = document.createElement('div');
    const labelElement = document.createElement('strong');

    labelElement.textContent = label + ': ';
    line.appendChild(labelElement);
    line.appendChild(document.createTextNode(value));
    if (isBorderTop) {
        line.style.borderTop = '1px solid rgba(255,255,255,0.25)';
        line.style.paddingTop = '4px';
    }
    if (isBorderBottom) {
        line.style.borderBottom = '1px solid rgba(255,255,255,0.25)';
        line.style.paddingBottom = '4px';
    }
    container.appendChild(line);
}

async function getBookingCalendarNotes(slot_id) {
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-slot-notes?slot_id=' + slot_id
    );

    const data = await response.json();
    return data;
} 

async function getBookingCalendarBookings(slot_id) {
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-slot-bookings?slot_id=' + slot_id
    );

    const data = await response.json();
    return data;
} 

async function getBookingCalendarDayBookings(date, exclude_slot_id) {
    const params = new URLSearchParams({
        date,
        exclude_slot_id
    });
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-day-bookings?' + params.toString()
    );

    const data = await response.json();
    return data;
}

async function addBookingCalendarNote(booking_id) {
    const { value: note } = await Swal.fire({
        title: 'Megjegyzés hozzáadása',
        input: 'textarea',
        inputPlaceholder: 'Megjegyzés',
        showCancelButton: true,
        allowEscapeKey: true,
        inputValidator: (value) => value ? null : 'A megjegyzés mező kötelező.'
    });

    if (!note) {
        return;
    }

    const response = await fetch(
        hotelBooking.restUrl + 'add-booking-note',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            },
            body: JSON.stringify({
                booking_id,
                note
            })
        }
    );
    const data = await response.json();

    if (!data.success) {
        Swal.fire({
            title: 'Hiba!',
            text: data.message || 'A megjegyzés hozzáadása sikertelen.',
            icon: 'error'
        });
        return;
    }

    bookingCalendarTooltipCache.clear();
    window.hotelBookingCalendar.refetchEvents();
    document.querySelector("button.swal2-confirm")?.click();
}

async function deleteBookingCalendarBooking(booking_id) {
    const result = await Swal.fire({
        title: 'Biztosan törölni szeretné a foglalást?',
        icon: 'question',
        showCancelButton: true,
        allowEscapeKey: true
    });

    if (!result.isConfirmed) {
        return;
    }

    const response = await fetch(
        hotelBooking.restUrl + 'delete-booking',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            },
            body: JSON.stringify({
                booking_id
            })
        }
    );
    const data = await response.json();

    if (!data.success) {
        Swal.fire({
            title: 'Hiba!',
            text: data.message || 'A foglalás törlése sikertelen.',
            icon: 'error'
        });
        return;
    }

    bookingCalendarTooltipCache.clear();
    window.hotelBookingCalendar.refetchEvents();
    document.querySelector("button.swal2-confirm")?.click();
}

function getBookingCalendarDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function renderBookingCalendarDayBookings(bookings) {
    if (!bookings.length) {
        return '';
    }

    return `
        <h3>További foglalás ezen a napon még</h3>
        <table class="booking-calendar-details">
            <thead>
                <tr>
                    <th>Név</th>
                    <th>Telefonszám</th>
                    <th style="width: 33%;">Szobák</th>
                    <th>Info</th>
                </tr>
            </thead>
            <tbody>
    ` + bookings.map((field) => {
        return `<tr>
                    <td>${field.extendedProps.customer_name}</td>
                    <td>${field.extendedProps.customer_phone}</td>
                    <td>${field.extendedProps.rooms}</td>
                    <td
                        data-monogram="${escapeBookingCalendarHtml(field.extendedProps.customer_monogram)}"
                        data-customer_email="${escapeBookingCalendarHtml(field.extendedProps.customer_email)}"
                        data-created_at="${escapeBookingCalendarHtml(field.created_at)}"
                        data-created_by="${escapeBookingCalendarHtml(field.extendedProps.created_by)}"
                    ><button type="button" onclick="toggleBookingCalendarBookingDetails(this)"> i </button></td>
                </tr>`;
    }).join('') + '</tbody></table>';
}

async function generateBookingCalendarSlots() {
    const url = hotelBooking.restUrl + 'generate-slots';
    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            }
        }
    );

    const data = await response.json();
    window.hotelBookingCalendar.refetchEvents();
    console.log(data);
}

async function generateUniqueBookingCalendarSlots(room, 
    range,
    duration) {
    const url = hotelBooking.restUrl + 'generate-unique-slots';
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
                duration
            })
        }
    );

    const data = await response.json();
    window.hotelBookingCalendar.refetchEvents();
    console.log(data);
}

async function generateUniqueBookingCalendarSlotsPopUp() {
    const room_select_html = document.getElementById('room-id').innerHTML;

    const { value: formValues } = await Swal.fire({

        title: 'Slot generálás',

        html: `
            <select id="room-id-for-slot-generate">
                ${room_select_html}
            </select>
            <input
                id="slot-date-range"
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
            const duration = document.getElementById("slot-duration").value;

            const isValid = (!!range);
            return [
                room, 
                range,
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

    const [room, range, duration, isValid] = formValues;
    if (isValid) { 
        // generate
        generateUniqueBookingCalendarSlots(room, 
            range,
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

async function updateBookingCalendarSlot(id, status) {

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

function toggleBookingCalendarBookingDetails(button) {
    const row = button.closest('tr');
    const cell = button.closest('td');
    const nextRow = row.nextElementSibling;

    if (nextRow && nextRow.classList.contains('booking-calendar-booking-details-row')) {
        nextRow.remove();
        return;
    }

    const labels = {
        monogram: 'Monogram',
        customer_email: 'E-mail',
        created_at: 'Létrehozva',
        created_by: 'Létrehozta',
        author_name: 'Szerző',
        customer_name: 'Ügyfél neve',
        note_type: 'Megjegyzés típusa',
        visibility: 'Láthatóság'
    };

    const details = cell.getAttributeNames()
        .filter((attribute) => attribute.startsWith('data-'))
        .map((attribute) => {
            const key = attribute.replace('data-', '');
            const label = labels[key] || key.replace(/_/g, ' ');
            const value = cell.getAttribute(attribute);

            if (key === 'customer_email') {
                const email = escapeBookingCalendarHtml(value);
                return `${label}: <a href="mailto:${email}">${email}</a>`;
            }

            return `${label}: ${escapeBookingCalendarHtml(value)}`;
        })
        .join('<br>');

    const detailsRow = document.createElement('tr');
    detailsRow.className = 'booking-calendar-booking-details-row';
    detailsRow.innerHTML = `<td colspan="${row.children.length}">${details}</td>`;
    row.insertAdjacentElement('afterend', detailsRow);
}

function escapeBookingCalendarHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function removeConfirmedRoom(e, id) {
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

async function removeRoom(e, id) {
    Swal.fire({
        title: "Biztosan törölni szeretné a szobát?",
        icon: "question",
        showCancelButton: true,
        allowEscapeKey: true,
        didOpen: () => {
            jQuery('.swal2-confirm')
                .on("click", function() { removeConfirmedRoom(e, id); })
        }
    });
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

function refreshBookingCalendarCalendar(){
    window.hotelBookingCalendar.refetchEvents();
}
