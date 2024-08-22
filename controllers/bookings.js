import express from "express";
import validator from "validator";
import access_control from "../access_control.js";
import * as BookingClassUsers from "../models/bookings-classes-users-location-activity.js"
import * as Bookings from "../models/bookings.js";
import * as Classes from "../models/classes.js";
import * as Locations from "../models/locations.js"
import * as Users from "../models/users.js"
import * as ClassActivityLocationTrainers from "../models/classes-activities-locations-trainers.js"
import * as Activities from "../models/activities.js"
import { formatDateTime } from "../utils.js";
import { convertToJSDate } from "../database.js";
import { convertToMySQLTime } from "../database.js";

const bookingController = express.Router();

bookingController.use((req, res, next) => {
    res.locals.accessRole = req.session.user ? req.session.user.accessRole : null
    res.locals.firstName = req.session.user ? req.session.user.firstName : null
    res.locals.userID = req.session.user? req.session.user.userID : null
    next()
})


bookingController.get(
    "/my_bookings",
    access_control(["member"]),
    async (req, res) => {
        try {
            const { userID, accessRole, firstName } = res.locals
            const allMyBookings = await BookingClassUsers.getAllByMemberId(userID)
            console.log("My bookings are:", allMyBookings)
            res.render("my_bookings.ejs", {allMyBookings, accessRole, firstName})
            console.log("my_bookings are", allMyBookings)

        } catch (error) {
            console.error("Error fetching bookings:", error)
            res.status(500).render("status.ejs", {
                status: "No bookings",
                message: "You have no bookings yet."
            })
        }
    })

bookingController.post(
    "/booking_confirmation",
    access_control(["member"]),
    async (req, res) => {
        try {
           
            const userID = req.session.user.userID
            console.log("userID is: ", userID)
            const classID = req.body.class_id
            console.log("ClassID is", classID)
            const bookingCreatedDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
            const editedBooking = Bookings.newBooking(null, userID, classID, bookingCreatedDateTime, 0);
            console.log("editedBooking: ", editedBooking)
            await Bookings.create(editedBooking)
            res.redirect("/my_bookings")
            

        } catch (error) {
            console.error("error post bookings:", error)
            res.status(500).render("status.ejs", {
                status: "Failed",
                message: error
            })
        }
    }
)

bookingController.get(
    "/manage_bookings",
    access_control(["admin"]),
    (req, res) => {
        const editID = req.query.edit_id;
        const { accessRole, firstName } = res.locals;
        const memberFilter = req.query.member_filter
        console.log("memberFilter is: ", memberFilter)

        let editBookingPromise = Promise.resolve(BookingClassUsers.newBookingClassUser(0, 0, 0, "", "", 0, "", 0, "", 0, "", "", "", ""));

        // If editID exists, fetch the editBooking
        if (editID) {
            editBookingPromise = BookingClassUsers.getById(editID);
            console.log("editBookingPromise is", editBookingPromise) 
        }

        
        const fetchAllDataPromise = (memberFilter) ? 
        Promise.all([
            BookingClassUsers.getAllByMemberId(memberFilter),
            Locations.getAll(),
            ClassActivityLocationTrainers.getAll(), 
            Activities.getAll(),
            Users.getAll()
        ]) :
        Promise.all([
            BookingClassUsers.getAll(),
            Locations.getAll(),
            ClassActivityLocationTrainers.getAll(), 
            Activities.getAll(),
            Users.getAll()
        ]);

        // Once all promises are resolved, render the view
        Promise.all([editBookingPromise, fetchAllDataPromise])
            .then(([editBooking, [allBookings, allLocations, allClasses, allActivities, allUsers]]) => {
                console.log("allBookings:", allBookings)
                
                console.log("This is editBooking", editBooking)
                const formattedDate = convertToJSDate(editBooking.class_datetime)
                console.log("formatted date", formattedDate); // Output: "2018-06-26"
                const formattedTime = convertToMySQLTime(editBooking.class_datetime).trim()
                console.log("formatted time",formattedTime)
         
                res.render("manage_bookings.ejs", {
                    allBookings,
                    allLocations,
                    allClasses,
                    allActivities,
                    allUsers,
                    editBooking,
                    accessRole,
                    firstName,
                    formattedDate,  
                    formattedTime 
                });
            })
            .catch(error => {
                res.render("status.ejs", {
                    status: "The member does not have any booking.",
                    message: error,
                });
            });
    }
);

bookingController.post("/my_bookings", (req, res) => {


    const bookingIdToDelete = req.body.booking_id
    console.log("bookingIdToDelete", bookingIdToDelete)
    Bookings.deleteById(bookingIdToDelete)
        .then(() => {
            res.redirect("/my_bookings")
        })
        .catch((error) => {
            console.log("error is:", error)
            res.render("status.ejs", {
                status: "Fail to delete the booking",
                message: "Please go back to My Bookings"
            })
        })
})


  // TODO: Validation of input data  
        // TODO: Sanitisation of input data  

        // Retrieve form data
bookingController.post(
            "/manage_bookings",
            access_control(["admin"]),
            async (req, res) => {
                try {

                    const { accessRole, firstName } = res.locals
                    const userID = req.session.user.userID

                    
                    const formData = req.body;      
                    console.log("Form data:", formData)     
                    const bookingID = formData.booking_id                      
                    const activityId = parseInt(formData.activity)
                    const trainerId = parseInt(formData.trainer)
                    const locationId = parseInt(formData.location)

                    const classId = parseInt(formData.class_id)
                    const classDate = formData.class_date
                    const classTime = formData.class_time
                    const classDateTime = `${classDate} ${classTime}`
                    const memberID = formData.member

                    const bookingCreatedDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
                   
                
                    // const classDateTime = new Date(`${classDate} ${classTime}`).toISOString().slice(0, 19).replace('T', ' ');


                    console.log("formatted date and time", classDateTime); 
        
                    const newBooking = Bookings.newBooking(null, memberID, classId, bookingCreatedDateTime, 0);
                    console.log("newBooking : ", newBooking)
                    const editedBooking = Bookings.newBooking(bookingID, memberID, classId, bookingCreatedDateTime, 0)
                    console.log("edited Booking: ",editedBooking)
                   
                    console.log("editedBooking", editedBooking)
                    switch (formData.action) {
                        case "create":
                            await Bookings.create(newBooking);
                            res.redirect("/manage_bookings");
                            break;
                        case "update":
                            await Bookings.update(editedBooking);
                            res.redirect("/manage_bookings");
                            break;
                        case "delete":
                            await Bookings.deleteById(editedBooking.id);
                            res.redirect("/manage_bookings");
                            break;
                        default:
                            res.render("status.ejs", {
                                status: "Invalid action",
                                message: "Invalid action specified."
                            });
                    }
                } catch (error) {
                    res.render("status.ejs", {
                        status: "Error",
                        message: "An error occurred: " + error.message
                    });
                }
            }
        );
        




export default bookingController;
