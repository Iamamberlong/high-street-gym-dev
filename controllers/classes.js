import express from "express";
import validator from "validator";
import access_control from "../access_control.js";
import * as Classes from "../models/classes.js";
import * as ClassActivityLocationTrainers from "../models/classes-activities-locations-trainers.js"
import * as Activities from "../models/activities.js"
import * as Users from "../models/users.js"
import * as Locations from "../models/locations.js"
import { formatDateTime } from "../utils.js";
import { convertToJSDate } from "../database.js";
import { convertToMySQLTime } from "../database.js";
import {convertToMySQLDate} from "../database.js"
import { getCurrentDate} from "../database.js"


const classController = express.Router();

classController.use((req, res, next) => {
    res.locals.accessRole = req.session.user ? req.session.user.accessRole : null
    res.locals.firstName = req.session.user ? req.session.user.firstName : null
    res.locals.userID = req.session.user? req.session.user.userID : null
    next()
})



///////////////////////////////// The following code works,so please do not delete. /////////////////////////////////

classController.get(
    "/manage_classes",
    access_control(["admin", "trainer"]),
    async (req, res) => {
        const editID = req.query.edit_id;
        const { accessRole, firstName } = res.locals;
        const userID = req.session.user.userID 

        const startDate = req.query.start_date 
        const endDate = req.query.end_date 
        const trainerFilter = req.query.trainer_filter

        console.log("req.query:", req.query)
        console.log("start Date:", startDate )      
        console.log("end date: ", endDate)
        console.log("trainer_filter", trainerFilter)
     
        // Define a default editClass object
        let editClassPromise = Promise.resolve(ClassActivityLocationTrainers.newClassActivityLocationTrainer(0, "", 0, "", 0, "", "", "", 0, "", ""));

        // If editID exists, fetch the editClass
        if (editID) {
            editClassPromise = ClassActivityLocationTrainers.getById(editID);
            console.log("editClassPromise: ", editClassPromise)
        }

       
       
        let fetchAllDataPromise
        if (accessRole === 'trainer') {
            console.log("accessRole is trainer: ", accessRole)
            console.log("The trainer user id is", userID)
            fetchAllDataPromise = Promise.all([
                ClassActivityLocationTrainers.getAllByTrainerId(userID),
                Locations.getAll(),
                Activities.getAll(),
                Users.getAll(),
            ]);
        } else {
// if no startdate or enddate or trainer is selected.
            if (!startDate && !endDate && !trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAll(),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                 
                ])
                //if there is only startDate to be selected.
            } else if (startDate && !endDate && !trainerFilter) {  
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("ONly startDate is picked: ", startDate)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByStartDate(startDate),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                  
                ])
                // if there is only endDate to be selected
            } else if (!startDate && endDate && !trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("Only Enddate is picked: ", endDate)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByEndDate(endDate),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                     
                ])
                // if there is only trainer to be picked
            } else if (!startDate && !endDate && trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("Only trainerFilter is picked: ", trainerFilter)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByTrainerId(trainerFilter),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                  
                ])
                //if endDate and trainer to be picked
            } else if (!startDate && endDate && trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("endDate and trainerFilter picked: ", endDate, trainerFilter)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByEndDateTrainerId(endDate, trainerFilter),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                     
                ])
                // if startDate and trainer to be picked
            } else if (startDate && !endDate && trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("startDate and endDate picked: ", startDate, endDate)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByStartDateTrainerId(startDate, trainerFilter),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                 
                ])
                // if all there are selected
            } else if (startDate && endDate && trainerFilter) {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("startDate and endDate and trainerFilter picked: ", startDate, endDate, trainerFilter)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByTrainerIDDateRange(trainerFilter, startDate, endDate),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                     
                ])  
            }  else {
                console.log("startDate, endDate, trainerFilter are: ", startDate, endDate, trainerFilter)
                console.log("startDate and endDate and trainerFilter picked: ", startDate, endDate, trainerFilter)
                fetchAllDataPromise = Promise.all([
                    ClassActivityLocationTrainers.getAllByDateRange(startDate, endDate),
                    Locations.getAll(),
                    Activities.getAll(),
                    Users.getAll(),
                    
                ]) 
            }
        }
 
        // Once all promises are resolved, render the view
        Promise.all([editClassPromise, fetchAllDataPromise])
            .then(([editClass, [allClasses, allLocations, allActivities, allUsers]]) => {
                
                console.log("This is editClass", editClass)
                const formattedDate = convertToJSDate(editClass.class_datetime)
                console.log("editClass.class_datetime:", editClass.class_datetime)
                console.log("formatted date:", formattedDate); // Output: "2018-06-26"
                const formattedTime = convertToMySQLTime(editClass.class_datetime).trim()
                console.log("formatted time is:",formattedTime)
                console.log("all classes in the get: ",  allClasses)

             
                res.render("manage_classes.ejs", {
                    allClasses,
                    allLocations,
                    allActivities,
                    allUsers,
                    startDate,
                    endDate,
                    trainerFilter,
                    userID,
                    editClass,
                    accessRole,
                    firstName,
                    formattedDate,  
                    formattedTime 
                });
            })
            .catch(error => {
                res.render("status.ejs", {
                    status: "",
                    message: error,
                });
            });
    }
);


classController.post(
            "/manage_classes",
            access_control(["admin", "trainer"]),
            async (req, res) => {
                try {
                    const formData = req.body;      
                    console.log("Form data", formData)                           
                    const activityId = parseInt(formData.activity)
                    const trainerId = parseInt(formData.trainer)
                    const locationId = parseInt(formData.location)

                    const classDate = formData.class_date;
                    const classTime = formData.class_time;
                    const classDateTime = `${classDate} ${classTime}`
                    
                    // const classDateTime = new Date(`${classDate} ${classTime}`).toISOString().slice(0, 19).replace('T', ' ');

                    console.log("formatted date and time", classDateTime); 
                    const editedClass = Classes.newClass(
                        parseInt(formData.class_id),
                        classDateTime,
                        formData.location,
                        formData.activity,
                        formData.trainer,
                        0)
                   
                    console.log("editedClass", editedClass)
                    switch (formData.action) {
                        case "create":
                            await Classes.create(editedClass);
                            res.redirect("/manage_classes");
                            break;
                        case "update":
                            await Classes.update(editedClass);
                            res.redirect("/manage_classes");
                            break;
                        case "delete":
                            await Classes.deleteById(editedClass.id);
                            res.redirect("/manage_classes");
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
        
classController.get("/classes", (req, res) => {
    const { accessRole, firstName } = res.locals;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date() 

    // Calculate the date of the Monday of the current week
    const mondayOfThisWeek = new Date()
    mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1))
    console.log("mondayOfThisWeek: ", mondayOfThisWeek)
    // Calculate the date of the Sunday of the current week
    const sundayOfThisWeek = new Date(mondayOfThisWeek)
   
    
    sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6)
    console.log("sundayOfThisWeek: ", sundayOfThisWeek)
    // Build an object with days as keys and lists of sale products as values
    const classesByDay = {
        "Monday": [],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": [],
        "Sunday": [],
    }
    const dateOfMonday = convertToJSDate(mondayOfThisWeek)
    const dateOfSunday = convertToJSDate(sundayOfThisWeek)
    // Query the database for the sale products between the start and end of the week
    ClassActivityLocationTrainers.getAllByDateRange(convertToMySQLDate(mondayOfThisWeek), convertToMySQLDate(sundayOfThisWeek))
        .then(classesThisWeek => {
            console.log("classesThisWeek: ", classesThisWeek)
            // Add each of the classes to it's respective day
            for (const classActivityLocationTrainer of classesThisWeek) {
                const classDayName = daysOfWeek[classActivityLocationTrainer.class_datetime.getDay()]
                console.log("classActivityLocationTrainer.class_datetime: ", classActivityLocationTrainer.class_datetime)
                console.log("classDayName:", classDayName)
                classesByDay[classDayName].push(classActivityLocationTrainer)
            }
            
            res.render("classes.ejs", { classesByDay, accessRole, firstName, mondayOfThisWeek, dateOfMonday, dateOfSunday })
            console.log("classesByDay: ", classesByDay)
        })
        
})


export default classController;
