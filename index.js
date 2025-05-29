const express = require('express'); 
const router = express.Router(); 
const dotenv = require('dotenv'); 



dotenv.config(); 

// Authentication
const credentials = {
    apiKey: process.env.API_KEY, 
    username: process.env.USERNAME 
};

// Require the AT package
const AfricasTalking = require('africastalking')(credentials); 

const sms = AfricasTalking.SMS; 

// Send SMS route 
router.post('/', (req, res) => {
    // const { to, message } = req.body || res.status...
    sms.send({
        to: '+250798922640', 
        message: 'Today is another day!', 
        enqueue: true
    }).then(response => {
        console.log(response);
        res.json(response); 
    }).catch(error => {
        console.log(error);
        res.json(error.toString());
    });
});

// Delivery callback route
router.post('/delivery', async(req, res) => {
    console.log(req.body); 
    res.status(200).json({
        status: 'success',
        message: 'SMS received successfully'
    })
});

module.exports = router; 















































// const express = require('express');
// const router = express.Router();
// const dotenv = require('dotenv');
// dotenv.config();

// const credentials = {
//   apiKey: process.env.API_KEY,
//   username: process.env.USERNAME,
// };

// const AfricasTalking = require('africastalking')(credentials);
// const sms = AfricasTalking.SMS;

// // Send SMS - Update this to accept dynamic messages & recipients
// router.post('/', async (req, res) => {
//   const { to, message } = req.body;

//   if (!to || !message) {
//     return res.status(400).json({ error: 'Recipient number and message are required' });
//   }

//   try {
//     const response = await sms.send({
//       to, // Can be a string or array of phone numbers
//       message,
//       enqueue: true,
//     });
//     console.log('SMS Response:', response);
//     res.status(200).json(response);
//   } catch (error) {
//     console.error('SMS Error:', error);
//     res.status(500).json({ error: error.toString() });
//   }
// });

// // Delivery reports callback
// router.post('/delivery', (req, res) => {
//   console.log('Delivery report received:', req.body);
//   res.status(200).json({
//     status: 'success',
//     message: 'Delivery report received',
//   });
// });

// module.exports = router;
