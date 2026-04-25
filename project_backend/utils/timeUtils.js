// utils/timeUtils.js

// Convert 12-hour format to 24-hour format
export const convert12to24 = (time12h) => {
  if (!time12h) return '';
  
  const [time, period] = time12h.includes(' ') 
    ? time12h.split(' ') 
    : [time12h, 'AM']; // Default to AM if no period specified
  
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = minutes ? parseInt(minutes, 10) : 0;

  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert 24-hour format to 12-hour format for display
export const convert24to12 = (time24h) => {
  if (!time24h) return '';
  
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours, 10);
  minutes = minutes ? parseInt(minutes, 10) : 0;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Normalize time to 24-hour format regardless of input format
export const normalizeTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.includes(' ') ? convert12to24(timeStr) : timeStr;
};