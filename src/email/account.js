const sgMail = require('@sendgrid/mail')

const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'mamyrov.abylai@gmail.com',
        subject: 'Welcome to the Task App',
        text: `Welcome, ${name}  and let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'mamyrov.abylai@gmail.com',
        subject: 'We are sorry to say you bye-bye',
        text: 'Good bye! If you have some suggestion, reply to this email :)',
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}