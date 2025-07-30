const express = require('express');
const { AddDoctorDetails } = require('../controllers/doctorController');

const router = express.Router();

router.post('/add_doctor_details', AddDoctorDetails)