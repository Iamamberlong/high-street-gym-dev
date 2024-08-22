import { db_conn } from "../database.js";

export function newLocation(
    id,
    name
) {
    return {
        id,
        name 
    }
}

// Get all locations.

export function getAll() {
    return db_conn.query("SELECT * FROM locations")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newLocation(
                    result.location_id,
                    result.location_name
                )
            )
        })
}


export function create(location) {
    return db_conn.query(
        `INSERT INTO locations (location_name)
        VALUES (?)
        `,
        [location.name]
    )
}

export function getIDByName(locationName) {
    return db_conn.query(
        `SELECT * FROM locations WHERE location_name = ?`, [locationName])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]
                return newLocation(
                    result.location_id,
                    result.location_name
                )
              
            } else {
                return Promise.reject("No Matching results.")
            }
        })
}

export function getByID(locationID) {
    return db_conn.query(`SELECT * FROM locations WHERE location_id = ?`, [locationID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]

                return newLocation(
                    result.location_id,
                    result.location_name
                )
            } else {
                return Promise.reject("No matching results")
            }
        })
}

export function update(location) {
    return db_conn.query(
        `
        UPDATE locations
        SET location_name = ?
        WHERE location_id = ?`,
        [location.id]
    )
}

