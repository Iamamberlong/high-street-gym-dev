import express from "express";
import * as Locations from "../models/locations.js";
import validator from "validator";
import access_control from "../access_control.js";


const locationController = express.Router();

classController.use((req, res, next) => {
    res.locals.accessRole = req.session.user ? req.session.user.accessRole : null
    res.locals.firstName = req.session.user ? req.session.user.firstName : null
    res.locals.userID = req.session.user? req.session.user.userID : null
    next()
})


locationController.get("/locations", (req, res) => {
    Locations.getAll().then(locations => {
        res.render("locations.ejs", {accessRole, firstName, locations})
        console.log("locations are", locations)
    })
})

export default locationController
