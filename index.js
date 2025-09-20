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

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

// Send SMS route 
router.post('/', async (req, res) => {
    try {
        console.log('=== SMS Send Request ===');
        console.log('Raw body:', req.body);
        
        // Extract data from request body
        const { to, message, from } = req.body;  // Keep 'from' extraction, but ignore it
        
        console.log(`To: ${to}, From: ${from}, Message: ${message}`);  // Logging still shows it
        
        // Validate required fields
        if (!to || !message) {
            const error = 'Missing required fields: to and message are required';
            console.error('Validation Error:', error);
            return res.status(400).json({
                success: false,
                error: error
            });
        }
        
        // Validate phone number format (Rwanda)
        const phoneRegex = /^\+250[0-9]{9}$/;
        if (!phoneRegex.test(to)) {
            const error = 'Invalid phone number format. Use +250XXXXXXXXX';
            console.error('Phone Validation Error:', error);
            return res.status(400).json({
                success: false,
                error: error
            });
        }
        
        // Validate message length
        if (message.length > 160) {
            const error = 'Message too long. Maximum 160 characters allowed';
            console.error('Message Length Error:', error);
            return res.status(400).json({
                success: false,
                error: error
            });
        }
        
        // Prepare SMS options (DO NOT ADD 'from' to use default sender)
        const smsOptions = {
            to: to,
            message: message,
            enqueue: true
        };
        
        console.log('SMS Options:', smsOptions);
        
        // Send SMS
        const response = await sms.send(smsOptions);
        
        console.log('Africa\'s Talking Response:', JSON.stringify(response, null, 2));
        
        // Return success response
        res.status(200).json({
            success: true,
            data: response,
            message: 'SMS sent successfully'
        });
        
    } catch (error) {
        console.error('SMS Error Details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Return error response
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send SMS',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Test SMS route with detailed logging
router.post('/test', async (req, res) => {
    try {
        console.log('=== Test SMS Request ===');
        console.log('Request body:', req.body);
        
        // Use provided data or defaults
        const testMessage = {
            to: req.body.to || '+250786980814',
            message: req.body.message || `Test message from Africa's Talking SMS Service at ${new Date().toISOString()}`,
            from: req.body.from || 'INEZA'
        };
        
        console.log('Test SMS data:', testMessage);
        
        const response = await sms.send({
            to: testMessage.to,
            message: testMessage.message,
            from: testMessage.from,
            enqueue: true
        });
        
        console.log('Test SMS Response:', JSON.stringify(response, null, 2));
        
        res.status(200).json({
            success: true,
            message: 'Test SMS sent successfully',
            data: response,
            test_data: testMessage
        });
        
    } catch (error) {
        console.error('Test SMS Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Health check route
router.get('/health', (req, res) => {
    console.log('Health check requested');
    res.status(200).json({
        status: 'healthy',
        service: 'Africa\'s Talking SMS Service',
        timestamp: new Date().toISOString(),
        credentials: {
            apiKey: credentials.apiKey ? 'Set (***' + credentials.apiKey.slice(-10) + ')' : 'Not Set',
            username: credentials.username || 'Not Set'
        }
    });
});

// Debug route to test credentials
router.get('/debug', (req, res) => {
    console.log('Debug info requested');
    res.status(200).json({
        service: 'Africa\'s Talking SMS Debug',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        credentials: {
            apiKey: credentials.apiKey ? 'Set (length: ' + credentials.apiKey.length + ')' : 'Not Set',
            username: credentials.username || 'Not Set',
            api_key_preview: credentials.apiKey ? credentials.apiKey.substring(0, 10) + '...' : 'Not Set'
        },
        available_env: {
            API_KEY: process.env.API_KEY ? 'Set' : 'Not Set',
            USERNAME: process.env.USERNAME ? 'Set' : 'Not Set'
        }
    });
});

// Delivery callback route
router.post('/delivery', async (req, res) => {
    console.log('=== Delivery Report ===');
    console.log('Delivery Report Body:', req.body); 
    
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
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /': 'Send SMS',
            'POST /test': 'Send test SMS',
            'POST /delivery': 'Delivery callback',
            'GET /health': 'Health check',
            'GET /debug': 'Debug information',
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

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Unhandled Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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








































