document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('agent-booking-calendar');
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
            const agentId = 0;

              const response = await fetch(
                  agentBooking.restUrl + 'calendar-events?agent_id=' + agentId
              );

              const data = await response.json();

              successCallback(data);
          },
          eventClick: function(info) {

                Swal.fire({

                    title: 'Slot részletek',

                    html: info.event.extendedProps.status === 'FREE' ? `
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

                        <p>
                            <button onclick="bookingSlot(${info.event.extendedProps.slot_id})">FOGLALÁS</button>
                            
                        </p>
                    ` :
                    `
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
                    `
                });
            }
        });
        calendar.render();
        window.agentBookingCalendar = calendar;
      });

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
