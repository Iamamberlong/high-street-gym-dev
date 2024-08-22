import bcrypt from "bcryptjs";
import express from "express";
import access_control from "../access_control.js";
import * as Users from "../models/users.js";
import * as Bookings from "../models/bookings.js"
import * as Classes from "../models/classes.js"
import validator from "validator";

const userController = express.Router();

userController.use((req, res, next) => {
    res.locals.accessRole = req.session.user ? req.session.user.accessRole : null
    res.locals.firstName = req.session.user ? req.session.user.firstName : null
    res.locals.userID = req.session.user? req.session.user.userID : null
    next()
})

userController.get("/login", (req, res) => {
    res.render("login.ejs");
});

userController.post("/login", (req, res) => {
    const login_email = req.body.email;
    const login_password = req.body.password;

    Users.getByEmailAddress(login_email).then(loggedUser => {

        if (bcrypt.compareSync(login_password, loggedUser.password)) {
            req.session.user = {
                userID: loggedUser.id,
                accessRole: loggedUser.role,
                firstName: loggedUser.firstname
            };
            console.log("req.session.user", req.session.user)
            res.redirect("/classes");

        } else {
            res.render("status.ejs", { status: "Login Failed", message: "Invalid password" });
        }

    }).catch(error => {
        res.render("status.ejs", { status: " User not found", message: error });
    })
});


userController.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

userController.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

userController.post("/signup", (req, res) => {

    const { accessRole, firstName } = res.locals;

    const formData = req.body
    const unitNumber = formData.unit_number
    const streetNumber = formData.street_number
    const streetName = formData.street_name
    const streetType = formData.street_type
    const suburb = formData.suburb
    const postCode = formData.post_code

    let address = ""
    if (unitNumber) {
        address += "Unit " + unitNumber + ", "
    }

    address += streetNumber + " " + streetName + " " + streetType + ", " + suburb + ", " + postCode;

    if (!validator.isEmail(formData.email)) {
        res.render("status.ejs", {
            status: "Invalid email",
            message: "Please input an valid email."
        })
        return
    }

    if (!validator.isLength(formData.password, {min: 6}) ||
        !validator.isAlphanumeric(formData.password)) {
            res.render("status.ejs", {
                status: "Invalid  password",
                message: "Password must at least 6 letters and only contain numbers and letters."
            })
            return
    }

    if (!validator.isMobilePhone(formData.phone, 'en-AU')) {
        res.render("status.ejs", {
            status: "Invalid mobile phone number",
            message: "Phone number needs to be a valid Australian mobile phone number."
        })
        return
    }


    if (!validator.isAlpha(formData.first_name)){
        res.render("status.ejs", {
            status: "Invalid first name",
            message: "First name must be letters",
        });
        return
    }
    if (!validator.isAlpha(formData.last_name)){
        res.render("status.ejs", {
            status: "Invalid last name",
            message: "Last name must be letters",
        });
        return
    }

    if (formData.unit_number && (!validator.isNumeric(formData.unit_number))) {
        res.render("status.ejs", {
          status: "Invalid unit number",
          message: "Unit number must be a number."  
        })
        return
    }

    if (!validator.isNumeric(formData.street_number)) {
        res.render("status.ejs", {
          status: "Invalid street number",
          message: "Street number must be a number."  
        })
        return
    }
    
    if (!validator.isAlpha(formData.street_name)){
        res.render("status.ejs", {
            status: "Invalid street name",
            message: "Street name must be letters",
        });
        return
    }

    if (!validator.matches(formData.suburb, /^[A-Za-z\s]+$/)){
        res.render("status.ejs", {
            status: "Invalid suburb name",
            message: "Suburb name must be letters and spaces only",
        });
        return
    }
    
    if (!validator.isNumeric(formData.post_code)) {
        res.render("status.ejs", {
          status: "Invalid post code",
          message: "Post code must be a number."  
        })
        return
    }

    
    const newUser = Users.newUser(
        null,
        validator.escape(formData.email),
        bcrypt.hashSync(formData.password, 10),
        "member",
        validator.escape(formData.phone),
        validator.escape(formData.first_name),
        validator.escape(formData.last_name),
        validator.escape(address)
    )

    Users.create(newUser)
        .then(([result]) => {
        req.session.user = {
            userID: result.insertId,
            accessRole: newUser.role,
            firstName: newUser.firstname
        }
        console.log("The new created user is logged in as req.session.user:", req.session.user)
        res.redirect("/classes")
        })
        .catch(error => {
            console.error("Error creating user:", error);
            res.render("status.ejs", {
                status: "Error",
                message: "An error occurred while creating the user."
            })
        })
})


userController.get("/manage_users", access_control(["admin"]), (req, res) => {
    const { accessRole, firstName } = res.locals;
    const editID = req.query.edit_id;
    console.log("In get /manage_user' handler: accessRole", accessRole, "firstname:", firstName);
    if (editID) {
        Users.getById(editID).then(editUser => {

            Users.getAll().then(allUsers => {
                res.render("manage_users.ejs" , {
                    allUsers,
                    editUser,
                    accessRole,
                    firstName,              
                })
            })
        })
    } else {
        Users.getAll().then(allUsers => {
            res.render("manage_users.ejs", {
                allUsers,
                editUser: Users.newUser(0, "", "", "", "", "", "", ""),
                accessRole,
                firstName
            })
        })
    }
});

userController.post(
    "/manage_users", access_control(["admin"]),
    (req, res) => {
        const formData = req.body;

        if (!formData.email || !formData.password || !formData.access_role || !formData.phone || !formData.first_name || !formData.last_name || !formData.address) {
            res.render("status.ejs", {
                status: "Error",
                message: "All fields are required when creating new user."
            });
            return;
        }

        if (!validator.isEmail(formData.email)) {
            res.render("status.ejs", {
                status: "Invalid email",
                message: "Please input an valid email."
            })
            return
        }

        if (!validator.isAlpha(formData.first_name)){
            res.render("status.ejs", {
                status: "Invalid first name",
                message: "First name must be letters",
            });
            return
        }
        if (!validator.isAlpha(formData.last_name)){
            res.render("status.ejs", {
                status: "Invalid last name",
                message: "Last name must be letters",
            });
            return
        }

        if (!validator.isLength(formData.password, {min: 6}) ||
            !validator.isAlphanumeric(formData.password)) {
                res.render("status.ejs", {
                    status: "Invalid  password",
                    message: "Password must at least 6 letters and only contain numbers and letter."
                })
                return
            }
        
        // if (!validator.isMobilePhone(formData.phone, 'en-AU')) {
        //     res.render("status.ejs", {
        //         status: "Invalid mobile phone number",
        //         message: "Phone number needs to be a valid Australian mobile phone number."
        //     })
        //     return
        // }

        if (!/^04\d{8}$/.test(formData.phone)) {
            res.render("status.ejs", {
                status: "Invalid phone number",
                message: "Phone number must start with 04 and have 10 digits",
            });
            return;
        }
        

        // Create a user model object to represent the staff member submitted
        const editedUser = Users.newUser(
            formData.user_id,
            formData.email,
            formData.password,
            formData.access_role,
            formData.phone,
            formData.first_name,
            formData.last_name,
            formData.address
        )

        // hash the password if it isn't already hashed
             // hash the password if it is plain text
        if (!bcrypt.compareSync(formData.password, editedUser.password)) {
            editedUser.password = bcrypt.hashSync(formData.password);
        }

        // Determine and run CRUD operation
        if (formData.action == "create") {
            Users.create(editedUser).then(([result]) => {
                res.redirect("/manage_users");
            });
        } else if (formData.action == "update") {
            Users.update(editedUser).then(([result]) => {
                res.redirect("/manage_users");
            }).catch(error => {
                res.render("status.ejs", { status: " User not found", message: error });
            });
        } else if (formData.action == "delete") {
            Users.deleteById(editedUser.id).then(([result]) => {
                res.redirect("/manage_users");
            });
        }
    }
);

userController.get("/my_profile", (req, res) => {
    const { accessRole, firstName } = res.locals
    console.log("My accessRole is:", accessRole)
    const userID = req.session.user.userID
    Users.getById(userID).then(editUser => {
        res.render("my_profile.ejs", {accessRole, firstName, editUser})
    })
})

userController.post("/my_profile", (req, res) => {
    const { accessRole, firstName } = res.locals
    const userID = req.session.user.userID
    const formData = req.body

    const newUser = Users.newUser(
        userID,
        validator.escape(formData.email),
        formData.password,
        "member",
        validator.escape(formData.phone),
        validator.escape(formData.first_name),
        validator.escape(formData.last_name),
        validator.escape(formData.address)
    )

    Users.update(newUser)
        .then(([result]) => {
        res.redirect("/my_profile")
        })

})


userController.post("/create_user", (req, res) => {
    const { email, password, role } = req.body;

    // Validate input fields

    // Hash the password (similar to how you've done it before)

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            // Handle error
            res.status(500).send("Internal Server Error");
            return;
        }

        // Create a new user object with the hashed password and specified role
        const newUser = new User({
            email: email,
            password: hashedPassword,
            role: role // This could be 'admin', 'trainer', or 'member'
        });

        // Save the new user to the database
        newUser.save((err, savedUser) => {
            if (err) {
                // Handle error
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(201).json({ message: "User created successfully", user: savedUser });
        });
    });
});


export default userController;
