var appointment = require("../models/Appointment")
var mongoose = require("mongoose")
var AppointmentFactory = require("../factories/AppointmentFactory")
var mailer = require("nodemailer")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {
  async Create(name, email, description, cpf, date, time) {
    var newAppo = new Appo({
      name,
      email,
      description,
      cpf,
      date,
      time,
      finished: false,
      notified: false
    })
    try {
      await newAppo.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async GetAll(showFinished) {
    if (showFinished) {
      return await Appo.find();
    } else {
      var appos = await Appo.find({ 'finished': false });
      var appointments = [];
      appos.forEach(appointment => {
        if (appointment.date) appointments.push(AppointmentFactory.Build(appointment))
      });
      return appointments;
    }
  }

  async GetById(id) {
    try {
      var event = await Appo.findOne({ '_id': id });
      return event;
    } catch (error) {
      console.log(error);
    }
  }

  async End(id) {
    try {
      await Appo.findByIdAndUpdate(id, { finished: true })
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async Search(query) {
    try {
      var appointments = await Appo.find().or([{ email: query }, { cpf: query }])
      return appointments;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async SendNotification() {
    var appointments = await this.GetAll(false)
    var transporter = mailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 25,
      auth: {
        user: '28f9a95ce5367c',
        pass: 'f0c1b494c58779'
      }
    })

    appointments.forEach(async appointment => {
      var date = appointment.start.getTime();
      var hour = 1000 * 60 * 60
      var gap = date - Date.now()

      if (gap <= hour && !appointment.notified) {

        await Appo.findByIdAndUpdate(appointment.id, { notified: true })
        
        transporter.sendMail({
          from: 'Test <test@email.com>',
          to: appointment.email,
          subject: 'Your appointment is soon',
          text: 'Be ready, your appointment is in 1 hour'
        })
      }
    })
  }

}

module.exports = new AppointmentService()