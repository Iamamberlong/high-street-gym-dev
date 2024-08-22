import { db_conn } from "../database.js"
import { convertToMySQLDate } from "../database.js"

export function newClassActivityLocationTrainer(
    id, 
    class_datetime, 
    location_id,
    location_name,
    activity_id,
    activity_name,
    activity_description,
    activity_duration,
    trainer_user_id,
    user_firstname,
    user_lastname

) {
    return {
        id, 
        class_datetime, 
        location_id,
        location_name,
        activity_id,
        activity_name,
        activity_description,
        activity_duration,
        trainer_user_id,
        user_firstname,
        user_lastname
    }
}

export function getAll() {
    return db_conn.query(`
    SELECT 
    class_id,
    class_datetime,
    class_location_id,
    location_name,
    class_activity_id,
    activity_name,
    activity_description,
    activity_duration,
    class_trainer_user_id,
    user_firstname,
    user_lastname
    FROM classes
    INNER JOIN locations
    ON classes.class_location_id = locations.location_id
    INNER JOIN activities
    ON classes.class_activity_id = activities.activity_id
    INNER JOIN users
    ON classes.class_trainer_user_id = users.user_id WHERE classes.class_removed = 0
    `)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newClassActivityLocationTrainer(
                    result.class_id,
                    result.class_datetime,
                    result.class_location_id,
                    result.location_name,
                    result.class_activity_id,
                    result.activity_name,
                    result.activity_description,
                    result.activity_duration,
                    result.class_trainer_user_id,
                    result.user_firstname,
                    result.user_lastname

                )
            )
        })
}

// export function getAll() {
//     return db_conn.query(`
//     SELECT 
//     classes.class_id as class_id, 
//     classes.class_datetime as class_datetime,
//     classes.class_location_id as class_location_id,
//     locations.location_name as location_name,
//     classes.class_activity_id as class_activity_id,
//     activities.activity_name as activity_name,
//     activities.activity_description as activity_description,
//     activities.activity_duration as activity_duration,
//     classes.class_trainer_user_id as trainer_user_id,
//     users.user_firstname as trainer_firstname,
//     users.user_lastname as trainer_lastname
//     FROM classes
//     INNER JOIN locations
//     ON classes.class_location_id = locations.location_id
//     INNER JOIN activities
//     ON classes.class_activity_id = activities.activity_id
//     INNER JOIN users
//     ON classes.class_trainer_user_id = users.user_id
//     `)
//         .then(([queryResult]) => {
//             // convert each result into a model object
//             return queryResult.map(
//                 result => newClassActivityLocationTrainer(
//                     result.class_id,
//                     result.class_datetime,
//                     result.class_location_id,
//                     result.location_name,
//                     result.class_activity_id,
//                     result.activity_name,
//                     result.activity_description,
//                     result.activity_duration,
//                     result.class_trainer_user_id,
//                     result.user_firstname,
//                     result.user_lastname

//                 )
//             )
//         })
// }

// get classes by location name

export function getByLocationName(locationName) {
    return db_conn.query(`
    SELECT 
    *
    FROM classes
    INNER JOIN locations
    ON classes.class_location_id = locations.location_id
    INNER JOIN activities
    ON classes.class_activity_id = activities.activity_id
    INNER JOIN users
    ON classes.class_trainer_user_id = users.user_id
    WHERE location_name = ? AND classes.class_removed = 0
    `, [locationName])
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newClassActivityLocationTrainer(
                    result.class_id,
                    result.class_datetime,
                    result.class_location_id,
                    result.location_name,
                    result.class_activity_id,
                    result.activity_name,
                    result.activity_description,
                    result.activity_duration,
                    result.class_trainer_user_id,
                    result.user_firstname,
                    result.user_lastname
                )
            )
        })
}


export function getById(classID) {
    return db_conn.query(`
    SELECT 
    *   
    FROM classes
    INNER JOIN locations
    ON classes.class_location_id = locations.location_id
    INNER JOIN activities
    ON classes.class_activity_id = activities.activity_id
    INNER JOIN users
    ON classes.class_trainer_user_id = users.user_id
    WHERE class_id = ? AND classes.class_removed = 0
    `, [classID])
    .then(([queryResult]) => {
        // Convert each result into a model object
        if (queryResult.length > 0) {
            const result = queryResult[0];
            // Assuming newClassActivityLocationTrainer is a constructor function for your model
            return new newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            );
        } else {
            return Promise.reject("No matching results.");
        }
    });
}



// get classes using trainerID
export function getAllByTrainerId(trainerID) {
    return db_conn.query(`
    SELECT 
    class_id,
    class_datetime,
    class_location_id,
    location_name,
    class_activity_id,
    activity_name,
    activity_description,
    activity_duration,
    class_trainer_user_id,
    user_firstname,
    user_lastname
    FROM classes
    INNER JOIN locations
    ON classes.class_location_id = locations.location_id
    INNER JOIN activities
    ON classes.class_activity_id = activities.activity_id
    INNER JOIN users
    ON classes.class_trainer_user_id = users.user_id
    WHERE class_trainer_user_id = ? AND classes.class_removed = 0
    `, [trainerID]).then(([queryResult]) => {
        return queryResult.map(result => 
            newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            ))     
    })
}


// create a new class
export function create(gymClass) {
    return db_conn.query(
        `
        INSERT INTO classes 
        (class_datetime, class_location_id, class_activity_id, class_trainer_user_id) 
        VALUES (, ?, ?, ?, ?)
    `,
        [gymClass.datetime, gymClass.location_id, gymClass.activity_id, gymClass.trainer_user_id]
    );
}

// update an existing class
export function update(gymClass) {
    return db_conn.query(
        `
        UPDATE classes
        SET class_datetime = ?, class_location_id = ?, class_activity_id = ?, class_trainer_user_id = ?
        WHERE class_id = ?
    `,
        [gymClass.datetime, gymClass.location_id, gymClass.activity_id, gymClass.trainer_user_id]
    );
}


// delete a class

export function deleteById(classID) {
    // Instead of actually deleting classes we just flag them
    // as removed. This allows us to hide "deleted" classes, while
    // still maintaining referential integrity with the bookings table.
    return db_conn.query(`
    UPDATE classes
    SET class_removed = 1
    WHERE class_id = ?
    `, [classID])
}

export function getAllByDateRange(startDate, endDate) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE DATE(class_datetime) BETWEEN ? AND ? AND classes.class_removed = 0
        `,
        [startDate, endDate]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}


// export function getEarliestDate() {
//     return db_conn.query(
//         `SELECT MIN(class_datetime) AS earliest_date FROM classes
//         INNER JOIN locations
//         ON classes.class_location_id = locations.location_id
//         INNER JOIN activities
//         ON classes.class_activity_id = activities.activity_id
//         INNER JOIN users
//         ON classes.class_trainer_user_id = users.user_id WHERE class_removed = 0`
//     ).then(([queryResult]) => {
//         return queryResult[0].earliest_date;
//     });
// }


export function getAllByTrainerIDDateRange(trainerID, startDate, endDate) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE class_trainer_user_id = ? AND (DATE(class_datetime) BETWEEN ? AND ?) AND classes.class_removed = 0
        `,
        [trainerID, startDate, endDate]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}

export function getAllByStartDate(startDate) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE DATE(class_datetime) >= ? AND classes.class_removed = 0
        `,
        [startDate]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}

export function getAllByStartDateTrainerId(startDate, trainerID) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE DATE(class_datetime) >= ?  AND class_trainer_user_id = ? AND classes.class_removed = 0
        `,
        [startDate, trainerID]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}

export function getAllByEndDate(endDate) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE DATE(class_datetime) <= ? AND classes.class_removed = 0
        `,
        [endDate]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}

export function getAllByEndDateTrainerId(endDate, trainerID) {
    return db_conn.query(
        ` 
        SELECT 
        class_id,
        class_datetime,
        class_location_id,
        location_name,
        class_activity_id,
        activity_name,
        activity_description,
        activity_duration,
        class_trainer_user_id,
        user_firstname,
        user_lastname
        FROM classes
        INNER JOIN locations
        ON classes.class_location_id = locations.location_id
        INNER JOIN activities
        ON classes.class_activity_id = activities.activity_id
        INNER JOIN users
        ON classes.class_trainer_user_id = users.user_id
        WHERE DATE(class_datetime) <= ? AND class_trainer_user_id = ? AND classes.class_removed = 0
        `,
        [endDate, trainerID]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newClassActivityLocationTrainer(
                result.class_id,
                result.class_datetime,
                result.class_location_id,
                result.location_name,
                result.class_activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration,
                result.class_trainer_user_id,
                result.user_firstname,
                result.user_lastname
            )
        )
    })
}

