import { db_conn } from "../database.js";

export function newUser(
    id,
    email,
    password,
    role,
    phone,
    firstname,
    lastname,
    address
) {
    return {
        id,
        email,
        password,
        role,
        phone,
        firstname,
        lastname,
        address
    }
}

// Create the commented out function is not checking if the email or phone already exists in the database.
// export function create(user) {
//     return db_conn.query(
//         `
//         INSERT INTO users 
//         (user_email, user_password, user_role, user_phone, user_firstname, user_lastname, user_address)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//     `,
//         [user.user_email, user.user_password, user.user_role, user.user_phone, user.user_firstname, user.user_lastname, user.user_address]
//     );
// }

export function create(user) {
    // Check if the email already exists
    return db_conn.query("SELECT * FROM users WHERE user_email = ?", [user.email])
        .then(([existingUsers]) => {
            if (existingUsers.length > 0) {
                // Email already exists, reject the creation
                return Promise.reject("Email already exists");
            } else {
                // Check if the phone number already exists
                return db_conn.query("SELECT * FROM users WHERE user_phone = ?", [user.phone]);
            }
        })
        .then(([existingUsers]) => {
            if (existingUsers.length > 0) {
                // Phone number already exists, reject the creation
                return Promise.reject("Phone number already exists");
            } else {
                // Both email and phone number are unique, proceed with insertion
                return db_conn.query(
                    "INSERT INTO users (user_email, user_password, user_role, user_phone, user_firstname, user_lastname, user_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [user.email, user.password, user.role, user.phone, user.firstname, user.lastname, user.address]
                );
            }
        })
        .catch((error) => {
            return Promise.reject(error)
        });
}


// list all users for admin to manage

export function getAll() {
    return db_conn.query(`SELECT * FROM users WHERE user_removed = 0`)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address  
                )
            )
        })
}

export function getAllByRole(userRole) {
    return db_conn.query(`SELECT * FROM users WHERE user_role = ? AND user_removed = 0`, [userRole])
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address  
                )
            )
        })
}

// search user by id so that a filtering function is to be realised.
export function getById(userID) {
    return db_conn.query(`SELECT * FROM users WHERE user_id = ? AND user_removed = 0`, [userID])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                // get the first matching result
                const result = queryResult[0]
                // convert result into a model object
                return newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address  
                )
            } else {
                return Promise.reject("no matching results")
            }

        })
}

// This function is to get trainer id by their name, 
export function getIDByName(firstName, lastName, userRole) {
    return db_conn.query(`SELECT * FROM users WHERE user_firstname = ? AND user_lastname = ? AND user_role = ? AND user_removed = 0` , [firstName, lastName, userRole])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                const result = queryResult[0]
                return newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address
                )
                // convert result into a model object
                
            } else {
                return Promise.reject("no matching results")
            }

        })
}



// search user by their email address
export function getByEmailAddress(emailAddress) {
    return db_conn.query(`SELECT * FROM users WHERE user_email = ? AND user_removed = 0`, [emailAddress])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                // get the first matching result
                const result = queryResult[0]

                // convert result into a model object
                return newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address  
                )
            } else {
                return Promise.reject("no matching results")
            }

        })
}

// search user by their email address
export function getByUserRole(userRole) {
    return db_conn.query(`SELECT * FROM users WHERE user_role = ? AND user_removed = 0`, [userRole])
        .then(([queryResult]) => {
            return queryResult.map(
                result => newUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address  
                )
            )
        })
}

// Update a user's information. the following update function updates without checking if duplicated email
// or phone number exists.
// export function update(user) {
//     return db_conn.query(
//         `
//         UPDATE users
//         SET user_email = ?, user_password = ?, user_role = ?, user_phone = ?, user_firstname = ?, user_lastname = ?, user_address = ?)
//         WHERE user_id = ?
//     `,
//     [user.email, user.password, user.role, user.phone, user.firstname, user.lastname, user.address, user.id]
//     );
// }

export function update(user) {
    // Check if the email already exists
    return db_conn.query("SELECT * FROM users WHERE user_email = ? AND user_removed = 0", [user.user_email])
        .then(([existingUsers]) => {
            if (existingUsers.length > 0) {
                // Email already exists, reject the creation
                return Promise.reject("Email already exists");
            } else {
                // Check if the phone number already exists
                return db_conn.query("SELECT * FROM users WHERE user_phone = ?", [user.user_phone]);
            }
        })
        .then(([existingUsers]) => {
            if (existingUsers.length > 0) {
                // Phone number already exists, reject the creation
                return Promise.reject("Phone number already exists");
            } else {
                // Both email and phone number are unique, proceed with insertion
                return db_conn.query(
                    `
                    UPDATE users
                    SET user_email = ?, user_password = ?, user_role = ?, user_phone = ?, user_firstname = ?, user_lastname = ?, user_address = ?
                    WHERE user_id = ? AND user_removed = 0
                `,
                [user.email, user.password, user.role, user.phone, user.firstname, user.lastname, user.address, user.id]
                );
            }
        });
}

// Delete
export function deleteById(userID) {
    return db_conn.query(`UPDATE users SET user_removed = 1 WHERE user_id = ?`, [userID]);
}


