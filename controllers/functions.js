import express from "express" 

const functionController = express.Router()

functionController.get("/privacy_policy", (req, res) => {
    res.render("privacy_policy.ejs")
})

export default functionController