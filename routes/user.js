const express = require("express")
const { handleUserSignup, handleUserLogin, handleUserLogout } = require("../controllers/user")
const router = express.Router()

router.post("/", handleUserSignup)
router.post("/login", handleUserLogin)
router.post("/logout", handleUserLogout)



module.exports = router