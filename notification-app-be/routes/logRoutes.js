const express = require("express");
const { createLog } = require("../controller/logController");

const router = express.Router();

router.post("/", createLog);

module.exports = router;
