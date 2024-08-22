import express from "express";
import session from "express-session";
import flash from "express-flash";

// Create an express app instance and define a port for later
const app = express();
const port = 8080;
const host = '0.0.0.0'

// Express session middleware automatically manages a session cookie
// that is used to give persistent state between requests, making
// the application stateful and overcoming the stateless nature of HTTP.
app.use(
    session({
        secret: "secret phrase",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);



app.use(flash())

// Enable the ejs view engine
app.set("view engine", "ejs");

// Enable support for URL-encoded request bodies (form posts)
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Redirect request to root to home page
app.get("/", (req, res) => {
    res.render("home")
});

// Serve static resources
app.use(express.static("static"));

// Hook up each controller
import classController from "./controllers/classes.js";
app.use(classController);
import bookingController from "./controllers/bookings.js";
app.use(bookingController);
import userController from "./controllers/users.js";
app.use(userController);
import blogController from "./controllers/blogs.js"
app.use(blogController);
import functionController from "./controllers/functions.js"
app.use(functionController)



// Start the listening for requests
// app.listen(port, () => {
//     console.log(`Express server started on http://localhost:${port}`);
// });

const server = app.listen(8080, "0.0.0.0", () => {
    const { address, port } = server.address();
    console.log(`Express server started on http://${address}:${port}`);
});

