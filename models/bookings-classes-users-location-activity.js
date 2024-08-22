import { db_conn } from "../database.js";

// This data model will deal with a booking that shows the user name, trainer name, activity name, location name, 

export function newBookingClassUser(
    id,
    member_id,
    class_id,
    created_datetime,
    class_datetime,
    location_id,
    location_name,
    activity_id,
    activity_name,
    trainer_id,
    trainer_firstname,
    trainer_lastname,
    member_firstname,
    member_lastname,
   
) {
    return {
        id,
        member_id,  
        class_id,
        created_datetime,
        class_datetime,
        location_id,
        location_name,
        activity_id,
        activity_name,
        trainer_id,
        trainer_firstname,
        trainer_lastname,
        member_firstname,
        member_lastname,     
    }
}

export function getAll() {
    return db_conn.query(`
        SELECT 
        b.booking_id as booking_id,
        m.user_id as member_id,
        c.class_id as class_id, 
        b.booking_created_datetime as booking_created_datetime,
        c.class_datetime as class_datetime, 
        l.location_id as location_id,
        l.location_name as location_name,
        a.activity_id as activity_id,
        a.activity_name as activity_name,
        c.class_trainer_user_id as trainer_id,
        t.user_firstname AS trainer_firstname,
        t.user_lastname AS trainer_lastname,
        m.user_firstname AS member_firstname,
        m.user_lastname AS member_lastname
        FROM bookings b
        INNER JOIN classes c
        ON c.class_id = b.booking_class_id
        INNER JOIN users m
        ON b.booking_user_id = m.user_id AND m.user_role = 'member'
        INNER JOIN users t
        ON c.class_trainer_user_id = t.user_id AND t.user_role = 'trainer'
        INNER JOIN locations l
        ON c.class_location_id = l.location_id
        INNER JOIN activities a
        ON c.class_activity_id = a.activity_id
        WHERE b.booking_removed = 0
      `)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newBookingClassUser(
                    result.booking_id,
                    result.member_id,
                    result.class_id,
                    result.booking_created_datetime,
                    result.class_datetime,
                    result.location_id,
                    result.location_name,
                    result.activity_id,
                    result.activity_name,
                    result.trainer_id,
                    result.trainer_firstname,
                    result.trainer_lastname,
                    result.member_firstname,
                    result.member_lastname,
                )
            )
        })
}

export function getById(bookingID) {
    return db_conn.query(`
        SELECT 
        b.booking_id as booking_id,
        m.user_id as member_id,
        c.class_id as class_id, 
        b.booking_created_datetime as booking_created_datetime,
        c.class_datetime as class_datetime, 
        l.location_id as location_id,
        l.location_name as location_name,
        a.activity_id as activity_id,
        a.activity_name as activity_name,
        c.class_trainer_user_id as trainer_id,
        t.user_firstname AS trainer_firstname,
        t.user_lastname AS trainer_lastname,
        m.user_firstname AS member_firstname,
        m.user_lastname AS member_lastname
        FROM bookings b
        INNER JOIN classes c
        ON c.class_id = b.booking_class_id
        INNER JOIN users m
        ON b.booking_user_id = m.user_id AND m.user_role = 'member'
        INNER JOIN users t
        ON c.class_trainer_user_id = t.user_id AND t.user_role = 'trainer'
        INNER JOIN locations l
        ON c.class_location_id = l.location_id
        INNER JOIN activities a
        ON c.class_activity_id = a.activity_id
        WHERE b.booking_removed = 0 AND booking_id = ?
      `, [bookingID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]

            return newBookingClassUser(
                    result.booking_id,
                    result.member_id,
                    result.class_id,
                    result.booking_created_datetime,
                    result.class_datetime,
                    result.location_id,
                    result.location_name,
                    result.activity_id,
                    result.activity_name,
                    result.trainer_id,
                    result.trainer_firstname,
                    result.trainer_lastname,
                    result.member_firstname,
                    result.member_lastname,
                )            
        } else {
            return Promise.reject("No matching results")
        }})    
}

// member userID
export function getAllByMemberId(memberID) {
    return db_conn.query(
        `
        SELECT 
        b.booking_id as booking_id,
        m.user_id as member_id,
        c.class_id as class_id, 
        b.booking_created_datetime as booking_created_datetime,
        c.class_datetime as class_datetime, 
        l.location_id as location_id,
        l.location_name as location_name,
        a.activity_id as activity_id,
        a.activity_name as activity_name,
        c.class_trainer_user_id as trainer_id,
        t.user_firstname AS trainer_firstname,
        t.user_lastname AS trainer_lastname,
        m.user_firstname AS member_firstname,
        m.user_lastname AS member_lastname
        FROM bookings b
        INNER JOIN classes c
        ON c.class_id = b.booking_class_id
        INNER JOIN users m
        ON b.booking_user_id = m.user_id AND m.user_role = 'member'
        INNER JOIN users t
        ON c.class_trainer_user_id = t.user_id AND t.user_role = 'trainer'
        INNER JOIN locations l
        ON c.class_location_id = l.location_id
        INNER JOIN activities a
        ON c.class_activity_id = a.activity_id
        WHERE m.user_id = ? and b.booking_removed = 0
      `,
        [memberID]
    ).then(([queryResult]) => {
        // check that at least 1 match was found
        if (queryResult.length > 0) {
            return queryResult.map(result => newBookingClassUser(
                result.booking_id,
                result.member_id,
                result.class_id,
                result.booking_created_datetime,
                result.class_datetime,
                result.location_id,
                result.location_name,
                result.activity_id,
                result.activity_name,
                result.trainer_id,
                result.trainer_firstname,
                result.trainer_lastname,
                result.member_firstname,
                result.member_lastname,
            ))
        } else {
            return Promise.reject("no matching results")
        }

    })
}

export function getAllByTrainerId(trainerID) {
    return db_conn.query(
        `
        SELECT 
        b.booking_id as booking_id,
        m.user_id as member_id,
        c.class_id as class_id, 
        b.booking_created_datetime as booking_created_datetime,
        c.class_datetime as class_datetime, 
        l.location_id as location_id,
        l.location_name as location_name,
        a.activity_id as activity_id,
        a.activity_name as activity_name,
        c.class_trainer_user_id as trainer_id,
        t.user_firstname AS trainer_firstname,
        t.user_lastname AS trainer_lastname,
        m.user_firstname AS member_firstname,
        m.user_lastname AS member_lastname
        FROM bookings b
        INNER JOIN classes c
        ON c.class_id = b.booking_class_id
        INNER JOIN users m
        ON b.booking_user_id = m.user_id AND m.user_role = 'member'
        INNER JOIN users t
        ON c.class_trainer_user_id = t.user_id AND t.user_role = 'trainer'
        INNER JOIN locations l
        ON c.class_location_id = l.location_id
        INNER JOIN activities a
        ON c.class_activity_id = a.activity_id
        WHERE t.user_id = ? and b.booking_removed = 0
      `,
        [trainerID]
    ).then(([queryResult]) => {
        // check that at least 1 match was found
        if (queryResult.length > 0) {
            return queryResult.map(result => newBookingClassUser(
                result.booking_id,
                result.member_id,
                result.class_id,
                result.booking_created_datetime,
                result.class_datetime,
                result.location_id,
                result.location_name,
                result.activity_id,
                result.activity_name,
                result.trainer_id,
                result.trainer_firstname,
                result.trainer_lastname,
                result.member_firstname,
                result.member_lastname,
            ))
        } else {
            return Promise.reject("no matching results")
        }

    })
}


export function getAllByEmail(Email) {
    return db_conn.query(
        `
        SELECT 
        * 
          FROM bookings 
          INNER JOIN classes 
          ON classes.class_id = bookings.booking_class_id
          INNER JOIN users 
          ON bookings.booking_user_id = users.user_id
          INNER JOIN locations 
          ON classes.class_location_id = locations.location_id
          INNER JOIN activities
          ON classes.class_activity_id = activities.activity_id
        WHERE classes.class_removed = 0 and bookings.booking_removed = 0
      `,
        [Email]
    ).then(([queryResult]) => {
        // check that at least 1 match was found
        if (queryResult.length > 0) {
            // get the first matching result
            const result = queryResult[0]

            // convert result into a model object
            return newBookingClassUser(
                result.id,
                result.user_id,
                result.class_id,
                result.created_datetime,
                result.class_datetime,
                result.location_id,
                result.location_name,
                result.activity_id,
                result.activity_name,
                result.class_trainer_user_id,
                result.class_trainer_firstname,
                result.class_trainer_lastname,
                result.user_firstname,
                result.user_lastname,
            )
        } else {
            return Promise.reject("no matching results")
        }

    })
}

// via a search item, the results will be filtered.
export function getBySearch(searchTerm) {
    return db_conn.query(
        `
        SELECT 
        * 
          FROM bookings 
          INNER JOIN classes 
          ON classes.class_id = bookings.booking_class_id
          INNER JOIN users 
          ON bookings.booking_user_id = users.user_id
          INNER JOIN locations 
          ON classes.class_location_id = locations.location_id
          INNER JOIN activities
          ON classes.class_activity_id = activities.activity_id
        WHERE bookings.booking_removed = 0 AND classes.class_removed = 0 AND (users.user_firstname LIKE ? OR users.user_lastname LIKE ?)
      `,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newBookingClassUser(
                result.id,
                result.user_id,
                result.class_id,
                result.created_datetime,
                result.class_datetime,
                result.location_id,
                result.location_name,
                result.activity_id,
                result.activity_name,
                result.class_trainer_user_id,
                result.class_trainer_firstname,
                result.class_trainer_lastname,
                result.user_firstname,
                result.user_lastname,
            )
        )

    })
}