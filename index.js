const express = require('express'); 
const router = express.Router(); 
const dotenv = require('dotenv'); 

dotenv.config(); 

// Authentication
const credentials = {
    apiKey: process.env.API_KEY || 'atsk_041dd0821e46ed67417f131a3f21ea8696f5dcfd1ef14bdc775413993672bda42f1904b0', 
    username: process.env.USERNAME || 'sandbox'
};

// Require the AT package
const AfricasTalking = require('africastalking')(credentials); 
const sms = AfricasTalking.SMS; 

// Send SMS route 
router.post('/', async (req, res) => {
    try {
        // Extract data from request body
        const { to, message, from } = req.body;
        
        // Validate required fields
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to and message are required'
            });
        }
        
        // Validate phone number format (Rwanda)
        const phoneRegex = /^\+250[0-9]{9}$/;
        if (!phoneRegex.test(to)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Use +250XXXXXXXXX'
            });
        }
        
        // Validate message length
        if (message.length > 160) {
            return res.status(400).json({
                success: false,
                error: 'Message too long. Maximum 160 characters allowed'
            });
        }
        
        // Prepare SMS options
        const smsOptions = {
            to: to,
            message: message,
            enqueue: true
        };
        
        // Add sender ID if provided and valid
        if (from && typeof from === 'string' && from.trim().length > 0) {
            smsOptions.from = from;
        }
        
        console.log('Sending SMS:', smsOptions);
        
        // Send SMS
        const response = await sms.send(smsOptions);
        
        console.log('SMS Response:', response);
        
        // Return success response
        res.status(200).json({
            success: true,
            data: response,
            message: 'SMS sent successfully'
        });
        
    } catch (error) {
        console.error('SMS Error:', error);
        
        // Return error response
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send SMS',
            details: error.toString()
        });
    }
});

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Africa\'s Talking SMS Service',
        timestamp: new Date().toISOString()
    });
});

// Test SMS route (for debugging)
router.post('/test', async (req, res) => {
    try {
        const testMessage = {
            to: '+250786980814',
            message: 'Test message from MdLink SMS Service',
            from: 'INEZA'
        };
        
        const response = await sms.send({
            to: testMessage.to,
            message: testMessage.message,
            from: testMessage.from,
            enqueue: true
        });
        
        res.status(200).json({
            success: true,
            message: 'Test SMS sent successfully',
            data: response
        });
        
    } catch (error) {
        console.error('Test SMS Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.toString()
        });
    }
});

// Delivery callback route
router.post('/delivery', async (req, res) => {
    console.log('Delivery Report:', req.body); 
    
    // Here you could save delivery status to database
    // or forward to your main application
    
    res.status(200).json({
        status: 'success',
        message: 'Delivery report received successfully'
    });
});

// Get service info
router.get('/', (req, res) => {
    res.status(200).json({
        service: 'Africa\'s Talking SMS Service',
        version: '1.0.0',
        endpoints: {
            'POST /': 'Send SMS',
            'POST /test': 'Send test SMS',
            'POST /delivery': 'Delivery callback',
            'GET /health': 'Health check',
            'GET /': 'Service info'
        },
        usage: {
            send_sms: {
                method: 'POST',
                url: '/',
                body: {
                    to: '+250XXXXXXXXX (required)',
                    message: 'Your message here (required, max 160 chars)',
                    from: 'SENDER_ID (optional)'
                }
            }
        }
    });
});

module.exports = router;



// const express = require('express'); 
// const router = express.Router(); 
// const dotenv = require('dotenv'); 



// dotenv.config(); 

// // Authentication
// const credentials = {
//     apiKey: process.env.API_KEY, 
//     username: process.env.USERNAME 
// };

// // Require the AT package
// const AfricasTalking = require('africastalking')(credentials); 

// const sms = AfricasTalking.SMS; 

// // Send SMS route 
// router.post('/', (req, res) => {
//     // const { to, message } = req.body || res.status...
//     sms.send({
//         to: '+250798922640', 
//         message: 'Today is another day!', 
//         enqueue: true
//     }).then(response => {
//         console.log(response);
//         res.json(response); 
//     }).catch(error => {
//         console.log(error);
//         res.json(error.toString());
//     });
// });

// // Delivery callback route
// router.post('/delivery', async(req, res) => {
//     console.log(req.body); 
//     res.status(200).json({
//         status: 'success',
//         message: 'SMS received successfully'
//     })
// });

// module.exports = router; 








































