/* eslint-disable camelcase */
const { DateTime } = require('luxon');

const formatDateArr = (availabilityArr, timeType, timeZoneLocation) => {
  // put array in ascending order to make it easier to read
  availabilityArr.sort(function (a, b) {
    return a - b;
  });
  // format time based on various format
  switch (timeType) {
    case 'newYork':
      const availabilityArr_EST = [];
      availabilityArr.forEach((timeslot, index) => {
        const newStart_AmericaNewYork = DateTime.fromMillis(
          parseInt(timeslot),
          {
            zone: 'America/New_York',
          }
        );
        availabilityArr_EST.push(
          newStart_AmericaNewYork.toFormat('ccc MMM dd yyyy T ZZZZ')
        );
      });
      return availabilityArr_EST;
    case 'local':
      const availabilityArr_Local = [];
      availabilityArr.forEach((timeslot, index) => {
        const newStart_Local = DateTime.fromMillis(
          parseInt(timeslot),
          {
            zone: timeZoneLocation
          }
        );
        availabilityArr_Local.push(
          newStart_Local.toFormat('ccc MMM dd yyyy T ZZZZ')
        );
      });
      return availabilityArr_Local;
    case 'time':
      return availabilityArr;
    case 'current':
      const dt = DateTime.local().setZone("America/New_York")
      return dt.toFormat('ccc MMM dd yyyy T ZZZZ');
    default:
      return null;
  }
};

const formatAvailabilityArr = (availabilityArr, timeZoneLocation) => {
  // [{dayName: 1, dayArr: []}, {dayName: 2, dayArr:[]} ]
  const formattedAvailabilityArr = [];
  let currentDayNum = 0;
  let dayIndex = -1;
  availabilityArr.forEach((timeSlot, index) => {
    const newTime = DateTime.fromMillis(parseInt(timeSlot), {
      zone: timeZoneLocation,
    });
    if (newTime.day > currentDayNum) {
      currentDayNum = newTime.day;
      dayIndex += 1;
      const currentDay = newTime.toFormat('ccc LLL d y');
      const newTimeSlot = newTime.toFormat('T');
      const newDayObj = { dayName: currentDay, dayArr: [newTimeSlot] };
      formattedAvailabilityArr.push(newDayObj);
    } else {
      const newTimeSlot = newTime.toFormat('T');
      formattedAvailabilityArr[dayIndex].dayArr.push(newTimeSlot);
    }
  });
  return formattedAvailabilityArr;
};

module.exports = { formatDateArr, formatAvailabilityArr };
