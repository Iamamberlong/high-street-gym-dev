import { db_conn } from "../database.js";

export function newBooking(
    id,
    user_id,
    class_id,
    created_datetime,
    removed
) {
    return {
        id,
        user_id,
        class_id,
        created_datetime,
        removed  
    }
}

// GEt all bookings

export function getAll() {
    return db_conn.query("SELECT * FROM bookings WHERE booking_removed = 0")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newBooking(
                    result.booking_id,
                    result.booking_user_id,
                    result.booking_class_id,
                    result.booking_created_datetime,
                    result.booking_removed 
                )
            )

        })
}


export function create(booking) {
    return db_conn.query(
        `INSERT INTO bookings (booking_user_id, booking_class_id, booking_created_datetime)
        VALUES (?, ?, ?)
        `,
        [
            booking.user_id, 
            booking.class_id,
            booking.created_datetime 
        ]
    )
}

export function getById(bookingID) {
    return db_conn.query(`SELECT * FROM bookings WHERE booking_id = ? and booking_removed = 0`, [bookingID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]

                return newBooking(
                    result.booking_id,
                    result.booking_user_id,
                    result.booking_class_id,
                    result.booking_created_datetime,
                    result.booking_removed
                )
            } else {
                return Promise.reject("No matching results")
            }
        })
}

export function update(booking) {
    return db_conn.query(
        `
        UPDATE bookings
        SET booking_user_id = ?, booking_class_id = ?, booking_created_datetime = ?
        WHERE booking_id = ?`,
        [booking.user_id, booking.class_id, booking.created_datetime, booking.id]
    )
}

export function deleteById(bookingID) {
    return db_conn.query(
        `
        UPDATE bookings
        SET booking_removed = 1 
        WHERE booking_id = ?`,
        [bookingID]

    )
}
// I am going to search by name, either first name or last name
// export function getBySearch(searchTerm)


// export function checkExistingBooking(classID, userID) {
//     return db_conn.query(
//         `SELECT COUNT(*)
//         FROM bookings
//         WHERE booking_class_id = ? AND booking_user_id = ?`,
//         [classID, userID]
//     )
// }

export async function checkExistingBooking(userID, classID) {
    try {
        // Execute the database query
        const [rows] = await db_conn.query(
            `SELECT COUNT(*) AS count
             FROM bookings
             WHERE booking_class_id = ? AND booking_user_id = ?`,
            [classID, userID]
        );

        // Extract the count from the result
        const count = rows[0].count;

        // Return true if count is greater than 0, indicating an existing booking
        return count > 0;
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error("Error checking existing booking:", error);
        throw error; // Propagate the error back to the caller
    }
}

