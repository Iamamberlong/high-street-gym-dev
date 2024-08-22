import { db_conn } from "../database.js";

export function newBlog(
    id,
    blogDatetime,
    user_id,
    title,
    content,
    archived
) {
    return {
        id,
        blogDatetime,
        user_id,
        title,
        content,
        archived
    }
}

// get all blog posts.
export function getAll() {
    return db_conn.query("SELECT * FROM blog_posts WHERE archived = 0")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newBlog(
                    result.post_id,
                    result.post_datetime,
                    result.post_user_id,
                    result.post_title,
                    result.post_content,
                    result.archived
                )
            )

        })
}

// get blog by id
export function getById(blogID) {
    return db_conn.query("SELECT * FROM blog_posts WHERE post_id = ? and archived = 0", [blogID])
        .then(([queryResult]) => {
            if (queryResult.length > 0) {
                const result = queryResult[0]
                return newBlog(
                    result.post_id,
                    result.post_datetime,
                    result.post_user_id,
                    result.post_title,
                    result.post_content,
                    result.archived
                )
            } else {
                return Promise.reject("no matching results")
            }
        })
}


// export function getByUserId(userID) {
//     return db_conn.query("SELECT * FROM blog_posts WHERE post_user_id = ? AND archived = 0 ", [userID])
//         .then(([queryResult]) => {
//             if (queryResult.length > 0) {
              
//                 return queryResult.map(result => newBlog(
//                     result.post_id,
//                     result.post_datetime,
//                     result.post_user_id,
//                     result.post_title,
//                     result.post_content,
//                     result.archived
//                 ))
//             } else {
//                 return Promise.reject("no matching results")
//             }
//         })
// }

export function getByUserId(userID) {
    return db_conn.query("SELECT * FROM blog_posts WHERE post_user_id = ? AND archived = 0", [userID])
        .then(([queryResult]) => {
            if (queryResult && queryResult.length > 0) {
                return queryResult.map(result => newBlog(
                    result.post_id,
                    result.post_datetime,
                    result.post_user_id,
                    result.post_title,
                    result.post_content,
                    result.archived
                ));
            } else {
                return []; // Return an empty array if no matching results
            }
        })
        .catch(error => {
            return Promise.reject("Error fetching blogs by user ID: " + error);
        });
}


// Create
export function create(blog) {
    return db_conn.query(
        `
        INSERT INTO blog_posts
        (post_datetime, post_user_id, post_title, post_content)
        VALUES (?, ?, ?, ?)
    `,
    [   
        blog.blogDatetime,
        blog.user_id,
        blog.title,
        blog.content
    ]
    );
}

export function getBySearch(searchTerm) {
    return db_conn.query(
        "SELECT * FROM blog_posts WHERE archived = 0 AND (post_title LIKE ? OR post_content LIKE ?)",
        [`%${searchTerm}%`, `%${searchTerm}%`]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newBlog(
                result.post_id,
                result.post_datetime,
                result.post_user_id,
                result.post_title,
                result.post_content,
                result.archived
            )
        )

    })
}

// Update
export function update(blog) {
    return db_conn.query(
        `
        UPDATE blog_posts
        SET post_title = ?, post_content = ?
        WHERE post_id = ?
    `,
        [blog.title, blog.content, blog.id]
    );
}

export function deleteById(blogID) {
    return db_conn.query(`
    UPDATE blog_posts
    SET archived = 1
    WHERE post_id = ?
    `, [blogID])
}
