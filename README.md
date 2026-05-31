# booking-calendar
Hotel Booking Calendar - WordPress Plugin

Based on [sumegizoltan73/agent-booking-plugin](https://github.com/sumegizoltan73/agent-booking-plugin)

## WordPress version
The plugin was tested on WordPress 7.0.0, but it also works on earlier and future versions because it does not rely on any specific WordPress function or procedure.

## How the plugin works
The plugin is a calendar-based booking system where bookings are assigned to daily slots, with some bookings spanning multiple days.

Customer details are stored with each booking, along with the booked room number or multiple room numbers. Notes, phone numbers, and email addresses can be added when creating a booking. These details are later displayed in a popup when clicking the booking slot in the calendar view. The most important booking details are also shown in a hover tooltip, but for a more comfortable display and for mobile use, the slot bar or row should be clicked or tapped. The clickable area differs depending on whether the calendar is in month view or week view.

Notes and bookings can be deleted, and separate notes can also be added to a slot, day, or date range. All of these are displayed. In the calendar view, each slot event only shows the room numbers and one of three basic color-coded statuses: FREE, BLOCKED, or BOOKED. This makes the booking system clear at first glance, including which rooms are booked for which dates.

## The development team
I (Zoltan Peter Sumegi) am the development team, with artificial intelligence also involved in the development process. With the help of ChatGPT and the Codex coding agent, a significant part of the programming work is carried out by an AI system. I created and designed the foundations of the plugin with some AI assistance, consulting with ChatGPT, and I continue to develop the plugin with Codex, increasingly relying on it as well. Some development solutions produced by the AI system may be inappropriate because of imprecise task descriptions, but thanks to GitHub-based version control, these can be corrected easily. Overall, a very significant part of the development is based on ChatGPT and Codex.

The pace of development is extremely fast, so most of the functionality was completed within days. There were cases where a change I made, such as introducing multiple slots within a single day and slots spanning multiple days, disrupted the entire UI and overall behavior. Fortunately, Codex understood the task and efficiently completed the changes needed to restore correct operation.

## Internationalization
The plugin translated to two languages, Hungarian and English. The Calendar control is also multi language.

## Releases
Version 1.0.0 was released 2026-05-31.

## Screenshots
[On the author's blog](https://www.programozo.info.hu/the-hotel-booking-calendar-is-ready/)

## License
The program is licensed under the MIT License and may be freely used, distributed, integrated, and modified. The license text is included with the code in the LICENCE file.

## Github repository
[sumegizoltan73 - Booking Calendar](https://github.com/sumegizoltan73/booking-calendar)

## Third-party code
The plugin uses third-party solutions, especially the following:
- [FullCalendar](https://fullcalendar.io)
- [SweetAllert2](https://sweetalert2.github.io)
- [Date Range Picker](https://www.daterangepicker.com)
