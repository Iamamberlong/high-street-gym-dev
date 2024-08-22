import { db_conn } from "../database.js";

// Order model (object) constructor
export function newBookingClass(
    booking_id,
    booking_user_id,
    class_id,
    booking_created_datetime,
    class_datetime,
    class_location_id,
    class_activity_id,
    class_trainer_user_id
) {
    return {
        booking_id,
        booking_user_id,
        class_id,
        booking_created_datetime,
        class_datetime,
        class_location_id,
        class_activity_id,
        class_trainer_user_id
    }
}

export function getAll() {
    return db_conn.query(
        `
        SELECT * 
        FROM bookings
        INNER JOIN classes
        ON bookings.booking_class_id = classes.class_id
        `
    )
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newBooking(
                    result.booking_id,
                    result.booking_user_id,
                    result.class_id,
                    result.booking_created_datetime,
                    result.class_datetime,
                    result.class_location_id,
                    result.class_activity_id,
                    result.class_trainer_user_id  
                )
            )

        })
}

export function getAllByBookingId(bookingID) {
    return db_conn.query(
        `
        SELECT * 
        FROM bookings
        INNER JOIN classes
        ON bookings.booking_class_id = classes.class_id
        WHERE bookings.booking_id = ?
    `,
        [bookingID]
    ).then(([queryResult]) => {
        // check that at least 1 match was found
        if (queryResult.length > 0) {
            // get the first matching result
            const result = queryResult[0]

            // convert result into a model object
            return newBookingClass(
                result.booking_id,
                result.booking_user_id,
                result.class_id,
                result.booking_created_datetime,
                result.class_datetime,
                result.class_location_id,
                result.class_activity_id,
                result.class_trainer_user_id  
            )
        } else {
            return Promise.reject("no matching results")
        }

    })
}