import { db_conn } from "../database.js";

export function newClass(
    id,
    class_datetime,
    location_id,
    activity_id,
    trainer_user_id,
    removed
) {
    return {
        id,
        class_datetime,
        location_id,
        activity_id,
        trainer_user_id,
        removed  
    }
}

// GEt all classes

export function getAll() {
    return db_conn.query("SELECT * FROM classes WHERE class_removed = 0")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newClass(
                    result.class_id,
                    result.class_datetime,
                    result.class_location_id,
                    result.class_activity_id,
                    result.class_trainer_user_id,
                    result.class_removed 
                )
            )

        })
}


// get a classes by location_id, 
export function create(gymClass) {
    return db_conn.query(
        `INSERT INTO classes (class_datetime, class_location_id, class_activity_id, class_trainer_user_id)
        VALUES (?, ?, ?, ?)
        `,
        [
            gymClass.class_datetime, 
            gymClass.location_id,
            gymClass.activity_id,
            gymClass.trainer_user_id
        ]
    )
}

export function getById(classID) {
    return db_conn.query(`SELECT * FROM classes WHERE class_id = ? and class_removed = 0`, [classID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]

                return newClass(
                    result.class_id,
                    result.class_datetime,
                    result.class_location_id,
                    result.class_activity_id,
                    result.class_trainer_user_id,
                    result.class_removed
                )
            } else {
                return Promise.reject("No matching results")
            }
        })
}

export function update(gymClass) {
    return db_conn.query(
        `
        UPDATE classes
        SET class_datetime = ?, class_location_id = ?, class_activity_id = ?, class_trainer_user_id = ?
        WHERE class_id = ?`,
        [gymClass.class_datetime, gymClass.location_id, gymClass.activity_id,  gymClass.trainer_user_id, gymClass.id]
    )
}

// I am going to search by name, either first name or last name
// export function getBySearch(searchTerm)


export function deleteById(classID) {
    return db_conn.query(
        `
        UPDATE classes
        SET class_removed = 1 
        WHERE class_id = ?`,
        [classID]
    )
}

export function getEarliestDate() {
    return db_conn.query(
        `
        SELECT MIN(class_datetime) as earliestDate
        FROM classes WHERE class_removed = 0`
    )
}

export function getLatestDate() {
    return db_conn.query(
        `
        SELECT MAX(class_datetime) as latestDate
        FROM classes WHERE class_removed = 0`
    )
}