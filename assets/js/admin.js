document.addEventListener('DOMContentLoaded', function() {
        const { __, _x, _n, sprintf } = wp.i18n;

        const slotDetailsText = __('slot-details', 'booking-calendar');
        const bookingText = __('BOOKING', 'booking-calendar');
        const blockText = __('BLOCK', 'booking-calendar');
        const freeText = __('FREE', 'booking-calendar');
        const bookingDetailsText = __('booking-details', 'booking-calendar');
        const nameText = __('Name', 'booking-calendar');
        const phoneText = __('Phone', 'booking-calendar');
        const roomsText = __('Rooms', 'booking-calendar');
        const infoText = __('Info', 'booking-calendar');
        const plusNotesText = __('Notes', 'booking-calendar');
        const notesText = __('Notes', 'booking-calendar');
        const deleteText = __('Delete', 'booking-calendar');
        const monographText = __('Monograph', 'booking-calendar');
        const stateText = __('State', 'booking-calendar');

        var calendarEl = document.getElementById('booking-calendar-admin-calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          locale: hotelBooking.locale || 'en',
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
            const search = getBookingCalendarSearchTerm();
            const params = new URLSearchParams({
                room_id: roomId
            });

            if (search) {
                params.set('search', search);
            }

              const response = await fetch(
                  hotelBooking.restUrl + 'calendar-events?' + params.toString()
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
                        <h3>${bookingDetailsText}</h3>
                        <table class="booking-calendar-details">
                            <thead>
                                <tr>
                                    <th>${nameText}</th>
                                    <th>${phoneText}</th>
                                    <th style="width: 33%;">${roomsText}</th>
                                    <th>${infoText}</th>
                                    <th>+${plusNotesText}</th>
                                    <th>${deleteText}</th>
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
                                    <td>${canManageBookingActions ? `<button type="button" onclick="addBookingCalendarNote(${field.extendedProps.booking_id})">+${plusNotesText}</button>` : ''}</td>
                                    <td>${canManageBookingActions ? `<button type="button" onclick="deleteBookingCalendarBooking(${field.extendedProps.booking_id})">${deleteText}</button>` : ''}</td>
                                </tr>`;
                    }).join('') + '</tbody></table>';

                    const bookednotes = await getBookingCalendarNotes(info.event.extendedProps.slot_id);
                    bookednote = `
                        <h3>${notesText}</h3>
                        <table class="booking-calendar-notes">
                            <thead>
                                <tr>
                                    <th>${monographText}</th>
                                    <th style="width: 73%;">${notesText}</th>
                                    <th>${infoText}</th>
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
                        <button class="button" onclick="bookingBookingCalendarSlot(${info.event.extendedProps.slot_id}, '${info.event.start.toLocaleString()}')">${bookingText}</button>
                    `;
                }
                buttons = `
                    <p>
                        <button class="button" onclick="updateBookingCalendarSlot(${info.event.extendedProps.slot_id}, 'BLOCKED')">${blockText}</button>
                        <span style="margin-left: 20px;">&nbsp;</span>
                        <button class="button" onclick="updateBookingCalendarSlot(${info.event.extendedProps.slot_id}, 'FREE')">${freeText}</button>
                        ${booking_button}
                    </p>
                `;

                const dayBookings = await getBookingCalendarDayBookings(
                    getBookingCalendarDateString(info.event.start),
                    info.event.extendedProps.slot_id
                );
                const day_bookings_html = renderBookingCalendarDayBookings(dayBookings);

                const notes = await getBookingCalendarSlotNotes(info.event.extendedProps.slot_id);
                const slot_notes_html = renderBookingCalendarSlotNotes(notes);
                const displayedEnd = new Date(info.event.end.setDate(info.event.end.getDate() - 1));
                let slotEnd = info.event.extendedProps.days > 1 ? ' - ' + displayedEnd.toLocaleString().replace(' 0:00:00', '').replace(' 00:00:00', '').replace(' 23:59:00', '').replaceAll('-', '. ') + '.' : '';
                slotEnd = slotEnd.replace('..', '.');
                Swal.fire({

                    title: slotDetailsText,

                    html: `
                        <p>
                            ${info.event.start.toLocaleString().replace(' 0:00:00', '')}${slotEnd}
                        </p>
                        ${renderBookingCalendarSlotNoteForm(info.event.extendedProps.slot_id)}
                        <p class="${info.event.extendedProps.status}" style="color: ${getBookingCalendarSlotColor(info.event.extendedProps.status)};">
                            ${stateText}:
                            ${info.event.extendedProps.status}
                        </p>
                        ${slot_notes_html}
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
let bookingCalendarSearchTimer = null;
let bookingCalendarSearchRequest = 0;
let bookingCalendarSearchResults = [];

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
        if (!bookingCalendarTooltipCache.has(slotId)) {
            bookingCalendarTooltipCache.set(slotId, Promise.all([
                Promise.resolve([]),
                Promise.resolve([]),
                getBookingCalendarSlotNotes(slotId)
            ]));
        }

        const [bookings, notes, slotNotes] = await bookingCalendarTooltipCache.get(slotId);

        return {
            title: event.title,
            status: event.extendedProps.status,
            bookings,
            notes,
            slotNotes
        };
    }

    if (!bookingCalendarTooltipCache.has(slotId)) {
        bookingCalendarTooltipCache.set(slotId, Promise.all([
            getBookingCalendarBookings(slotId),
            getBookingCalendarNotes(slotId),
            getBookingCalendarSlotNotes(slotId)
        ]));
    }

    const [bookings, notes, slotNotes] = await bookingCalendarTooltipCache.get(slotId);

    return {
        title: event.title,
        status: event.extendedProps.status,
        bookings,
        notes,
        slotNotes
    };
}

function renderBookingCalendarEventTooltip(details) {
    const { __, _x, _n, sprintf } = wp.i18n;

    const titleText = __('Title', 'booking-calendar');
    const statusText = __('Status', 'booking-calendar');
    const customerText = __('Customer', 'booking-calendar');
    const phoneText = __('Phone', 'booking-calendar');
    const notesText = __('Notes', 'booking-calendar');
    const slotNotesText = __('slot-notes', 'booking-calendar');

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

    appendBookingCalendarTooltipLine(tooltip, titleText, details.title);
    appendBookingCalendarTooltipLine(tooltip, statusText, details.status);

    details.bookings.forEach((booking) => {
        appendBookingCalendarTooltipLine(
            tooltip,
            customerText,
            booking.extendedProps.customer_monogram + ' (' + booking.extendedProps.rooms + ')' + ' - ' + booking.extendedProps.customer_name,
            true, 
            false
        );
        appendBookingCalendarTooltipLine(
            tooltip,
            phoneText,
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
        label.textContent = notesText + ':';
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

    const slotNotes = details.slotNotes
        .map((note) => note.author_monogram + ' - ' + note.extendedProps.note)
        .filter(Boolean);

    if (slotNotes.length) {
        const label = document.createElement('div');
        label.textContent = slotNotesText + ':';
        label.style.fontWeight = '700';
        label.style.marginTop = '4px';
        tooltip.appendChild(label);

        const list = document.createElement('ul');
        list.style.margin = '2px 0 0 16px';
        list.style.padding = '0';

        slotNotes.forEach((note) => {
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

async function getBookingCalendarSlotNotes(slot_id) {
    const response = await fetch(
        hotelBooking.restUrl + 'calendar-slot-own-notes?slot_id=' + slot_id
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
    const { __, _x, _n, sprintf } = wp.i18n;

    const addNoteText = __('add-note', 'booking-calendar');
    const notesText = __('Notes', 'booking-calendar');
    const noteRequiredText = __('the-note-field-is-required', 'booking-calendar');
    const noteSuccessText = __('note-is-added-successfully', 'booking-calendar');
    const errorText = __('Error', 'booking-calendar');

    const { value: note } = await Swal.fire({
        title: addNoteText,
        input: 'textarea',
        inputPlaceholder: notesText,
        showCancelButton: true,
        allowEscapeKey: true,
        inputValidator: (value) => value ? null : noteRequiredText
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
            title: errorText,
            text: data.message || noteSuccessText,
            icon: 'error'
        });
        return;
    }

    bookingCalendarTooltipCache.clear();
    window.hotelBookingCalendar.refetchEvents();
    document.querySelector("button.swal2-confirm")?.click();
}

function toggleBookingCalendarSlotNoteForm(slot_id) {
    const form = document.getElementById('booking-calendar-slot-note-form-' + slot_id);

    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

async function saveBookingCalendarSlotNote(slot_id) {
    const textarea = document.getElementById('booking-calendar-slot-note-' + slot_id);
    const note = textarea ? textarea.value.trim() : '';
    const { __, _x, _n, sprintf } = wp.i18n;

    const noteRequiredText = __('the-Note-field-is-required', 'booking-calendar');
    const noteSuccessText = __('note-is-added-successfully', 'booking-calendar');
    const errorText = __('Error', 'booking-calendar');

    if (!note) {
        Swal.showValidationMessage(noteRequiredText);
        return;
    }

    const response = await fetch(
        hotelBooking.restUrl + 'add-calendar-slot-note',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': hotelBooking.nonce
            },
            body: JSON.stringify({
                slot_id,
                note
            })
        }
    );
    const data = await response.json();

    if (!data.success) {
        Swal.fire({
            title: errorText,
            text: data.message || noteSuccessText,
            icon: 'error'
        });
        return;
    }

    bookingCalendarTooltipCache.clear();
    window.hotelBookingCalendar.refetchEvents();
    document.querySelector("button.swal2-confirm")?.click();
}

async function deleteBookingCalendarBooking(booking_id) {
    const { __, _x, _n, sprintf } = wp.i18n;

    const questionText = __('really-delete-this-booking', 'booking-calendar');
    const noteSuccessText = __('note-is-added-successfully', 'booking-calendar');
    const errorText = __('Error', 'booking-calendar');

    const result = await Swal.fire({
        title: questionText,
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
            title: errorText,
            text: data.message || noteSuccessText,
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

    const { __, _x, _n, sprintf } = wp.i18n;

    const otherBookingsText = __('other-bookings-on-this-day', 'booking-calendar');
    const nameText = __('Name', 'booking-calendar');
    const phoneText = __('Phone', 'booking-calendar');
    const roomsText = __('Rooms', 'booking-calendar');
    const infoText = __('Info', 'booking-calendar');

    return `
        <h3>${otherBookingsText}</h3>
        <table class="booking-calendar-details">
            <thead>
                <tr>
                    <th>${nameText}</th>
                    <th>${phoneText}</th>
                    <th style="width: 33%;">${roomsText}</th>
                    <th>${infoText}</th>
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

function renderBookingCalendarSlotNotes(notes) {
    if (!notes.length) {
        return '';
    }

    const { __, _x, _n, sprintf } = wp.i18n;

    const slotNotesText = __('slot-notes', 'booking-calendar');
    const infoText = __('Info', 'booking-calendar');
    const monographText = __('Monograph', 'booking-calendar');

    return `
        <h3>${slotNotesText}</h3>
        <table class="booking-calendar-notes">
            <thead>
                <tr>
                    <th>${monographText}</th>
                    <th style="width: 73%;">${slotNotesText}</th>
                    <th>${infoText}</th>
                </tr>
            </thead>
            <tbody>
    ` + notes.map((field) => {
        return `<tr>
                    <td>${escapeBookingCalendarHtml(field.author_monogram)}</td>
                    <td style="color: red;">${escapeBookingCalendarHtml(field.extendedProps.note)}</td>
                    <td
                        data-created_at="${escapeBookingCalendarHtml(field.created_at)}"
                        data-author_name="${escapeBookingCalendarHtml(field.extendedProps.author_name)}"
                        data-note_type="${escapeBookingCalendarHtml(field.extendedProps.note_type)}"
                        data-visibility="${escapeBookingCalendarHtml(field.extendedProps.visibility)}"
                    ><button type="button" onclick="toggleBookingCalendarBookingDetails(this)"> i </button></td>
                </tr>`;
    }).join('') + '</tbody></table>';
}

function renderBookingCalendarSlotNoteForm(slot_id) {
    const { __, _x, _n, sprintf } = wp.i18n;

    const notesText = __('Notes', 'booking-calendar');
    const saveText = __('Save', 'booking-calendar');

    return `
        <p>
            <button class="button" type="button" onclick="toggleBookingCalendarSlotNoteForm(${slot_id})">+${notesText}</button>
        </p>
        <div id="booking-calendar-slot-note-form-${slot_id}" style="display:none; margin-bottom: 12px;">
            <textarea id="booking-calendar-slot-note-${slot_id}" rows="3" style="width:100%; box-sizing:border-box;" placeholder="${notesText}"></textarea>
            <p>
                <button class="button button-primary" type="button" onclick="saveBookingCalendarSlotNote(${slot_id})">${saveText}</button>
            </p>
        </div>
    `;
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
    const { __, _x, _n, sprintf } = wp.i18n;

    const generateSlotsText = __('generate-unique-slots', 'booking-calendar');
    const oneDayText = __('one-day', 'booking-calendar');
    const errorText = __('Error', 'booking-calendar');
    const fillText = __('fill-all-fields', 'booking-calendar');

    const { value: formValues } = await Swal.fire({

        title: generateSlotsText,

        html: `
            <select id="room-id-for-slot-generate">
                ${room_select_html}
            </select>
            <input
                id="slot-date-range"
                class="swal2-input"
            />

            <select id="slot-duration">
                <option value="1440">${oneDayText}</option>
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

    if (!formValues) {
        return;
    }
    const [room, range, duration, isValid] = formValues;
    if (isValid) { 
        // generate
        generateUniqueBookingCalendarSlots(room, 
            range,
            duration);
    }
    else {
        Swal.fire({
            title: errorText,
            text: fillText,
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

    const { __, _x, _n, sprintf } = wp.i18n;

    const monographeText = __('Monographe', 'booking-calendar');
    const emailText = __('Email', 'booking-calendar');
    const createdText = __('created-at', 'booking-calendar');
    const createdByText = __('created-by', 'booking-calendar');
    const authorText = __('Author', 'booking-calendar');
    const customerNameText = __('Customer', 'booking-calendar');
    const noteTypeText = __('type-of-note', 'booking-calendar');
    const visibilityText = __('Visibility', 'booking-calendar');

    const labels = {
        monogram: monographeText,
        customer_email: emailText,
        created_at: createdText,
        created_by: createdByText,
        author_name: authorText,
        customer_name: customerNameText,
        note_type: noteTypeText,
        visibility: visibilityText
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

function getBookingCalendarSearchTerm() {
    const input = document.getElementById('booking-calendar-booking-search');

    return input ? input.value.trim() : '';
}

function updateBookingCalendarSearch() {
    window.clearTimeout(bookingCalendarSearchTimer);
    bookingCalendarSearchTimer = window.setTimeout(refreshBookingCalendarSearch, 250);
}

async function refreshBookingCalendarSearch() {
    const search = getBookingCalendarSearchTerm();
    const roomId = document.getElementById('room-id').value;
    const button = document.getElementById('booking-calendar-search-results-button');
    const requestId = ++bookingCalendarSearchRequest;
    const { __, _x, _n, sprintf } = wp.i18n;

    const searchResultsText = __('search-results', 'booking-calendar');
    
    bookingCalendarTooltipCache.clear();
    window.hotelBookingCalendar.refetchEvents();

    if (!search) {
        bookingCalendarSearchResults = [];
        if (button) {
            button.textContent = searchResultsText + ' (0 db)';
        }
        renderBookingCalendarSearchResultsModal();
        return;
    }

    const params = new URLSearchParams({
        search,
        room_id: roomId
    });
    const response = await fetch(
        hotelBooking.restUrl + 'booking-search-results?' + params.toString()
    );
    const data = await response.json();

    if (requestId !== bookingCalendarSearchRequest) {
        return;
    }

    bookingCalendarSearchResults = Array.isArray(data) ? data : [];
    if (button) {
        button.textContent = searchResultsText + ' (' + bookingCalendarSearchResults.length + ' db)';
    }
    renderBookingCalendarSearchResultsModal();
}

function showBookingCalendarSearchResults() {
    const { __, _x, _n, sprintf } = wp.i18n;

    const searchResultsText = __('search-results', 'booking-calendar');

    Swal.fire({
        title: searchResultsText + ' (' + bookingCalendarSearchResults.length + ' db)',
        html: '<div id="booking-calendar-search-results-modal">' + getBookingCalendarSearchResultsHtml() + '</div>',
        showConfirmButton: true,
        confirmButtonText: 'Bezár'
    });
}

function renderBookingCalendarSearchResultsModal() {
    const container = document.getElementById('booking-calendar-search-results-modal');
    const { __, _x, _n, sprintf } = wp.i18n;

    const searchResultsText = __('search-results', 'booking-calendar');

    if (!container) {
        return;
    }

    const title = document.querySelector('.swal2-title');
    if (title) {
        title.textContent = searchResultsText + ' (' + bookingCalendarSearchResults.length + ' db)';
    }
    container.innerHTML = getBookingCalendarSearchResultsHtml();
}

function getBookingCalendarSearchResultsHtml() {
    const { __, _x, _n, sprintf } = wp.i18n;

    const noResultsFoundText = __('no-results-found', 'booking-calendar');
    const roomNumberText = __('room-number', 'booking-calendar');
    const customerNameText = __('Customer', 'booking-calendar');
    const customerPhoneText = __('Phone', 'booking-calendar');
    const notesText = __('notes', 'booking-calendar');

    if (!getBookingCalendarSearchTerm() || !bookingCalendarSearchResults.length) {
        return '<p class="booking-calendar-search-no-results">' + noResultsFoundText + '</p>';
    }

    return bookingCalendarSearchResults.map((item) => {
        return `
            <div class="booking-calendar-search-result">
                <div><strong>${roomNumberText}:</strong> ${escapeBookingCalendarHtml(item.rooms)}</div>
                <div><strong>${customerNameText}:</strong> ${escapeBookingCalendarHtml(item.customer_name)}</div>
                <div><strong>${customerPhoneText}:</strong> ${escapeBookingCalendarHtml(item.customer_phone)}</div>
                <div><strong>${notesText}:</strong> ${escapeBookingCalendarHtml(item.notes)}</div>
            </div>
        `;
    }).join('');
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
    const { __, _x, _n, sprintf } = wp.i18n;

    const questionText = __('really-delete-this-room', 'booking-calendar');

    Swal.fire({
        title: questionText,
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

    const { __, _x, _n, sprintf } = wp.i18n;

    const activeText = __('Active', 'booking-calendar');
    const inactiveText = __('Inactive', 'booking-calendar');

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
                <td>${is_active ? activeText : inactiveText}</td>
                <td><button type="button" class="button remove-item" onclick="removeRoom(event, ${data.id})">–</button></td>
            </tr>
        `;
        let container = document.getElementById('booking-calendar-rooms-repeater');
        container.insertAdjacentHTML('beforeend', html);
    }
}

async function addRoomPopUp() {
    const { __, _x, _n, sprintf } = wp.i18n;

    const roomNumberText = __('room-number', 'booking-calendar');
    const roomNameText = __('room-name', 'booking-calendar');
    const capacityText = __('Capacity', 'booking-calendar');
    const isActiveText = __('Active', 'booking-calendar');
    const errorText = __('Error', 'booking-calendar');
    const allFieldsText = __('fill-all-fields', 'booking-calendar');
    const addText = __('adding-room', 'booking-calendar');

    const { value: formValues } = await Swal.fire({

        title: addText,

        html: `
            <div class="booking-calendar-item">
                <input type="text"
                    class="swal2-input"
                    id="booking-calendar_room_no"
                    value=""
                    placeholder="${roomNumberText}" />

                <input type="text"
                    class="swal2-input"
                    id="booking-calendar_room_name"
                    value=""
                    placeholder="${roomNameText}" />

                <input type="number"
                    class="swal2-input"
                    id="booking-calendar_capacity"
                    value=""
                    placeholder="${capacityText}" />
                <br /><br />
                <input type="checkbox"
                    class="swal2-checkbox"
                    id="booking-calendar_is_active"
                    style="width: 2em;"
                    checked />
                <span>${isActiveText}</span>
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

    if (!formValues) {
        return;
    }
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
            title: errorText,
            text: allFieldsText,
            icon: 'error'
        });
    }
}

function refreshBookingCalendarCalendar(){
    refreshBookingCalendarSearch();
}
