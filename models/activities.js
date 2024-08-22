import { db_conn } from "../database.js";

export function newActivity(
    id, 
    activity_name,
    description,
    duration
)  {return {
    id,
    activity_name,
    description,
    duration
}}

export function getAll() {
    return db_conn.query("SELECT * FROM activities")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newActivity(
                    result.activity_id,
                    result.activity_name,
                    result.activity_description,
                    result.activity_duration
                )
            )

        })
}

export function getById(activityID) {
    return db_conn.query("SELECT * FROM activities WHERE activity_id = ?", [activityID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]
                return newActivity(
                    result.activity_id,
                    result.activity_name,
                    result.activity_description,
                    result.activity_duration
                )
            } else {
                return Promise.reject("no matching results")
            }
        })
}

export function getIDByName(activityName) {
    return db_conn.query(`
    SELECT * FROM activities WHERE activity_name = ?`,
    [activityName])
    .then(([queryResult]) => {
        if (queryResult.length > 0) {
            const result = queryResult[0]
            return newActivity(
                result.activity_id,
                result.activity_name,
                result.activity_description,
                result.activity_duration
            )
            
       
        } else {
            return Promise.reject("No Matching results.")
        }
    })
}

export function create(activity) {
    return db_conn.query(
        `
        INSERT INTO activities
        (activity_name, activity_description, activity_duration)
        VALUES (?, ?, ?)
    `,
    [   
        activity.activity_name,
        activity.activity_description,
        activity.activity_duration
    ]
    );
}