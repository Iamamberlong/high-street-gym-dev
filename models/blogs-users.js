import { db_conn } from "../database.js";

export function newBlogUser(
    user_id,
    email,
    password,
    role,
    phone,
    firstname,
    lastname,
    address,
    id,
    post_datetime,
    title,
    content,
    archived
) {
    return {
        user_id,
        email,
        password,
        role,
        phone,
        firstname,
        lastname,
        address,
        id,
        post_datetime,
        title,
        content,
        archived
    }
}

export function getAll() {
    return db_conn.query(`
    SELECT * 
    FROM blog_posts 
    INNER JOIN users
    ON blog_posts.post_user_id = users.user_id
    WHERE archived = 0
    `)
        .then(([queryResult]) => {
            return queryResult.map(
                result => newBlogUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address,
                    result.post_id,
                    result.post_datetime,
                    result.post_title,
                    result.post_content,
                    result.archived  
                )
            )
        })
}

export function getByUserId(userID) {
    return db_conn.query(`
    SELECT * 
    FROM blog_posts 
    INNER JOIN users
    ON blog_posts.post_user_id = users.user_id
    WHERE post_user_id = ? AND archived = 0
    
    `, [userID])
        .then(([queryResult]) => {
            return queryResult.map(
                result => newBlogUser(
                    result.user_id,
                    result.user_email,
                    result.user_password,
                    result.user_role,
                    result.user_phone,
                    result.user_firstname,
                    result.user_lastname,
                    result.user_address,
                    result.post_id,
                    result.post_datetime,
                    result.post_title,
                    result.post_content,
                    result.archived  
                )
            )
        })
}

export function getBySearch(searchTerm) {
    return db_conn.query(
    `
    SELECT * 
    FROM blog_posts 
    INNER JOIN users
    ON blog_posts.post_user_id = users.user_id
    WHERE post_title LIKE ? OR post_content LIKE ?
    AND archived = 0
    `,
        [`%${searchTerm}%`, `%${searchTerm}%`]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newBlogUser(
                result.user_id,
                result.user_email,
                result.user_password,
                result.user_role,
                result.user_phone,
                result.user_firstname,
                result.user_lastname,
                result.user_address,
                result.post_id,
                result.post_datetime,
                result.post_title,
                result.post_content,
                result.archived   
            )
        )

    })
}