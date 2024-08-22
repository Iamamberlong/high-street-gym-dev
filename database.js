import mysql from "mysql2/promise";

export const db_conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1qaz2wsx",
  database: "high-street-gym-db",
});

export function convertToJSDate(date) {
  const year = date.toLocaleString('default', {year: 'numeric'});
  const month = date.toLocaleString('default', {
    month: '2-digit',
  });
  const day = date.toLocaleString('default', {day: '2-digit'});

  return [year, month, day].join('-');
}

// export function convertToMySQLTime(time) {


export function convertToMySQLTime(time) {
  const timeString = time.toLocaleString('en-AU', {hour12: false})

  return timeString.slice(11, 20)
}

export function convertToMySQLDate(date) {
  const year = date.toLocaleString('en-AU', {year: 'numeric'});
  const month = date.toLocaleString('en-AU', {
    month: '2-digit',
  });
  const day = date.toLocaleString('en-AU', {day: '2-digit'});

  return [year, month, day].join('/');

}

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
  const day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary
  return `${year}-${month}-${day}`;
}