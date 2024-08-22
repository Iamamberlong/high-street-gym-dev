import express from "express";
import * as Blogs from "../models/blogs.js";
import * as BlogsUsers from "../models/blogs-users.js"
import validator from "validator";
import access_control from "../access_control.js";

const blogController = express.Router();

// This is to get the accessRole and firstName which are to be used when a user logged in. 
// You do not have to get firstName but I think you better get accessRole, because using accessRole can help us render a role-based page.
blogController.use((req, res, next) => {
    res.locals.accessRole = req.session.user ? req.session.user.accessRole : null
    res.locals.firstName = req.session.user ? req.session.user.firstName : null
    res.locals.userID = req.session.user? req.session.user.userID : null
    next()
})

// this controller is for rendering the localhost:8080/blogs when your port is defined as 8080.
blogController.get("/blogs", (req, res) => {
// get the accessRole and firstName 
    const { accessRole, firstName, userID } = res.locals
   
    // In my blogs page, I applied a search function, therefore, first of all, check if there is a search_term, if there is one, then it calls a method that i 
    // defined in the data model which you could refer to Japser's coffee shop product search.
    if (req.query.search_term) {
        BlogsUsers.getBySearch(req.query.search_term)
            .then(blogs => {
            res.render("blogs.ejs", { blogs, accessRole, firstName, userID })
            console.log("blogs", blogs)
            .catch(error => {
                res.render("status.ejs", {
                    status: "Something went wrong",
                    message: error
                })
            })
        })
    } else {
        BlogsUsers.getAll()
            .then(blogs => {
            res.render("blogs.ejs", { blogs, accessRole, firstName, userID })
            console.log("blogs are ", blogs)
        })
            .catch(error => {
                res.render("status.ejs", {
                    status: "Something went wrong",
                    message: error
                })
            })
    }
   
})

// When the /blogs page is rendered, a list of blog titles are shown. When click on a single title, this will bring viewer to the blog_content page.

blogController.get("/blog_content", (req, res) => {
    const blogId = req.query.id; 
    const { accessRole, firstName, userID } = res.locals;
   
  // Each blog has an id, calls the getById() method to pull the blog data from the database 
    Blogs.getById(blogId)
        .then(blog => {
            // Render the "blog_content.ejs" view with the content of the selected blog
            res.render("blog_content.ejs", { blog, accessRole, firstName, userID });
        })
        .catch(error => {
            res.render("status.ejs", {
                status: "something went wrong",
                message: error,
            });
        });
});


// because i applied a /my_blogs page, therefore, I have this get handler to get the blogs where user_id match the logged user's userid.
blogController.get("/my_blogs", (req, res) => {
    const { accessRole, firstName } = res.locals
    const userID = req.session.user.userID

    console.log("userId", userID)
 // userID is captured in the server.js
    BlogsUsers.getByUserId(userID) // Assuming the user ID is stored in the session
        .then(blogs => {
            res.render("blogs.ejs", { blogs, accessRole, firstName });
            console.log("blogs are :", blogs)
        })
        .catch(error => {
            res.render("status.ejs", {
                status: "something went wrong",
                message: error,
            });
        });
});

// There is a create blog button on the /my_blogs page, if the button is pressed, then, bring up a new page to create the blog.
blogController.get("/create_blog", (req, res) => {
    res.render("create_blog.ejs")
})


// when creating blog, we are passing the data to the database, so this is a post request. 
// On the creat_
blogController.post("/create_blog", (req, res) => {
    const { accessRole, firstName, userID } = res.locals;
    console.log("point 1 userId is:" , userID)
    if (req.body) {
        let formData = req.body;

        if (!validator.isLength(formData.title, { min: 10})) {
            res.render("status.ejs", {
                status: "Title is too short",
                message: "Please make your title longer than 10 letters"
            })
            return
        }

        if (!validator.isLength(formData.content, { min: 100})) {
            res.render("status.ejs", {
                status: "Content is too short",
                message: "Please make your blog longer than 100 letters."
            })
            return
        }
// declare the newBlog object, which is the data we are going to insert into the database.
        const newBlog = Blogs.newBlog(
            // New model doesn't have an ID yet, so leave it as null, the id will be auto assigned when data is inserted into the database.
            null,
            (new Date().toISOString().slice(0, 19).replace('T', ' ')),
            userID,
            validator.escape(formData.title),
            validator.escape(formData.content),
            // 0 is for archived column, which has a default value 0 . 
            0
        )
// using the create method in the data model, to create , which essentially inserts the data into the database.
        Blogs.create(newBlog)
            .then(() => {
                res.redirect("/my_blogs");
            })
            .catch((error) => {
                res.render("status.ejs", {
                    status: "Failed to create blog",
                    message: error.message
                })
            })
    }
})

// I define this get handler exclusively to admin, actually, i could reuse the above, but when i wrote these code, I have not had a way of reuse. 
// I probably will rewrite some of the code. 
blogController.get("/manage_blogs", access_control(["admin"]), (req, res) => {
    const { accessRole, firstName } = res.locals;
    const userID = req.session.user.userID
// when the blog is being edited, then the request query which is part of the URL is abstracted, this value is saved as the editID variable.
    const editID = req.query.edit_id;
    console.log("In get /manage_blogs' handler: accessRole", accessRole, "firstname:", firstName);
// if there is something to be edited, then editID is true, it get the data from the database where id matches, and then it pulled all blogs data from database.
// you can refer the products page of the coffee shop, when the page just is opened, it pulls all the products, which is the else part of the if statement. and if there is 
// a blog to be edit, it pulls the data to be edited on the editing area (right side of the page), and all data on the left side. 
    if (editID) {
        Blogs.getById(editID).then(editBlog => {

            Blogs.getAll()
                .then(allBlogs => {
                res.render("manage_blogs.ejs" , {
                    allBlogs,
                    editBlog,
                    accessRole,
                    firstName,              
                    })
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "failed to get all blogs",
                        message: error.message
                    })
                })
        })
    } else {
        Blogs.getAll()
        .then(allBlogs => {
            res.render("manage_blogs.ejs", {
                allBlogs,
                editBlog: Blogs.newBlog(0, new Date().toISOString(), userID, "", "" ),
                accessRole,
                firstName
            })
        })
        .catch(error => {
            res.render("status.ejs", {
                status: "Failed to get all blogs",
                message: error.message
            })
        })
    }
});

// This is for either edit or create a new blog. 
blogController.post(
    "/manage_blogs", access_control(["admin"]),
    (req, res) => {
        const formData = req.body;
        const { accessRole, firstName } = res.locals;
        const userID = req.session.user.userID

        if (!validator.isLength(formData.title, { min: 10})) {
            res.render("status.ejs", {
                status: "Title is too short",
                message: "Please make your title longer than 10 letters"
            })
            return
        }

        if (!validator.isLength(formData.content, { min: 100})) {
            res.render("status.ejs", {
                status: "Content is too short",
                message: "Please make your blog longer than 100 letters."
            })
            return
        }

        const editBlog = Blogs.newBlog(
            formData.blog_id,
            new Date().toISOString(),
            userID,
            validator.escape(formData.title),
            validator.escape(formData.content),
        )


        // Determine and run CRUD operation
        if (formData.action == "create") {
            Blogs.create(editBlog).then(([result]) => {
                res.redirect("/manage_blogs");
            });
        } else if (formData.action == "update") {
            Blogs.update(editBlog).then(([result]) => {
                res.redirect("/manage_blogs");
            });
        } else if (formData.action == "delete") {
            Blogs.deleteById(editBlog.id).then(([result]) => {
                res.redirect("/manage_blogs");
            });
        }
    }
);

// This is when on a blog_content page. where there is blog title, blog content, and an edit and a delete button. 
// This post route handler is for process the edit function. 
blogController.post('/blog_content/:id', (req, res) => {
    const { id } = req.params; 
    const { title, content } = req.body;
    Blogs.update({id, title, content})
        .then(() => {
            res.redirect(`/blog_content?id=${id}`)
        })
        .catch((error) => {
            res.render("status.ejs", {
                status: "not be able to post edited blog",
                message: "please go back to your blog content page."
            })
        })
})

// This is for delete the blog, when delete button is pressed, the archive is acutally set to 1. then the blog is no longer shown on the page
// after deleting the blog, user is redirected to /my_blogs. 

// Essentially, one action corresponds to one root handler, get, post, put, patch, delete,  etc. 
blogController.post("/my_blogs", (req, res) => {
    const blogIdToDelete = req.body.blog_id
    console.log("blogIdToDelete", blogIdToDelete)
    Blogs.deleteById(blogIdToDelete)
        .then(() => {
            res.redirect("/my_blogs")
        })
        .catch((error) => {
            res.render("status.ejs", {
                status: "Fail to delete the blog",
                message: "Please go back to /my_blogs"
            })
        })
})

export default blogController;