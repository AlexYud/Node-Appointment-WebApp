const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const appointmentService = require("./services/AppointmentService")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

mongoose.connect("mongodb://localhost:27017/scheduleNode", { useNewUrlParser: true, useUnifiedTopology: true })

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/createAppoint", (req, res) => {
  res.render("create")
})

app.post("/create", async (req, res) => {
  var status = await appointmentService.Create(
    req.body.name,
    req.body.email,
    req.body.description,
    req.body.cpf,
    req.body.date,
    req.body.time
  )
  if (status) {
    res.redirect("/")
  } else {
    res.send('Error on creation!')
  }
})

app.get("/getcalendar", async (req, res) => {
  var appointments = await appointmentService.GetAll(false);
  res.json(appointments);
})

app.get("/event/:id", async (req, res) => {
  var appointment = await appointmentService.GetById(req.params.id)
  res.render("event", { appo: appointment });
})

app.post("/end", async (req, res) => {
  var id = req.body.id;
  var result = await appointmentService.End(id);
  if (result) res.redirect("/");
})

app.get("/list", async (req, res) => {
  var appointments = await appointmentService.GetAll(true);
  res.render("list", { appointments })
})

app.get("/search", async (req, res) => {
  var appointments = await appointmentService.Search(req.query.search)
  res.render("list", { appointments })
})

var pollTime = 1000 * 60 * 5
 
setInterval(async () => {
  await appointmentService.SendNotification();
}, pollTime);

app.listen(8080, () => {
  console.log('Server is running...');
})