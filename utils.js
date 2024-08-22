// utils.js
export function formatDateTime(dateString) {
    const date = new Date(dateString);
    
    // Format the date
    const formattedDate = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
    
    // Format the time
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure leading zero if needed
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure leading zero if needed
    const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensure leading zero if needed
    const formattedTime = `${hours}:${minutes}:${seconds}`; // "HH:MM:SS"
    
    return { date: formattedDate, time: formattedTime };
}






