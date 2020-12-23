const { DateTime } = require('luxon');

const getTimeZone = timeZoneType => {
  const newDate = new Date();
  switch (timeZoneType) {
    case 'timeZoneName':
      return newDate.toString().match(/\(([A-Za-z\s].*)\)/)[1];
    case 'timeZoneOffset':
      return newDate.getTimezoneOffset();
    case 'timeZoneLocation':
      return DateTime.fromMillis(newDate.getTime()).zoneName;
    case 'currentMoment':
      return DateTime.fromMillis(newDate.getTime(), {
        zone: 'America/New_York',
      }).toFormat('ccc MMM dd yyyy T ZZZZ');
    default:
      return null;
  }
};

const formatDateArr = (availabilityArr, timeType) => {
  // put array in ascending order to make it easier to read
  availabilityArr.sort(function(a, b) {
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
        const newStart_Local = DateTime.fromMillis(parseInt(timeslot));
        availabilityArr_Local.push(
          newStart_Local.toFormat('ccc MMM dd yyyy T ZZZZ')
        );
      });
      return availabilityArr_Local;
    case 'time':
      return availabilityArr;
    default:
      return null;
  }
};

const formatAvailabilityArr = (availabilityArr, timeZoneLocation) => {
  // [{dayName: 1, dayArr: []}, {dayName: 2, dayArr:[]} ]
  console.log(timeZoneLocation);
  const formattedAvailabilityArr = [];
  let currentDayNum = 0;
  let dayIndex = -1;
  availabilityArr.forEach((timeSlot, index) => {
    const newTime = DateTime.fromMillis(parseInt(timeSlot), {
      zone: timeZoneLocation,
    });
    console.log(`newTime: ${newTime}`);
    console.log(`newTime.day: ${newTime.day}`);
    console.log(`currentDayNum: ${currentDayNum}`);
    if (newTime.day > currentDayNum) {
      currentDayNum = newTime.day;
      dayIndex += 1;
      const currentDay = newTime.toFormat('ccc LLL d y');
      const newTimeSlot = newTime.toFormat('T');
      const newDayObj = { dayName: currentDay, dayArr: [newTimeSlot] };
      formattedAvailabilityArr.push(newDayObj);
    } else {
      const newTimeSlot = newTime.toFormat('T');
      console.log(formattedAvailabilityArr);
      console.log(`dayIndex: ${dayIndex}`);
      console.log(formattedAvailabilityArr[dayIndex]);
      formattedAvailabilityArr[dayIndex].dayArr.push(newTimeSlot);
    }
  });
  return formattedAvailabilityArr;
};

module.exports = { getTimeZone, formatDateArr, formatAvailabilityArr };
