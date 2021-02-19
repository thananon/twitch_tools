/** http server by express.js */

const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');

// load middleware
const getUrl = require('../middleware/getUrl');
const getVersion = require('../middleware/getVersion');
const getWidgets = require('../middleware/getWidgets');

// load controller
const dashboardController = require('../controllers/dashboard');
const widgetsController = require('../controllers/widgets');

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// setup public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// use middleware
app.use(getUrl)
app.use(getVersion)
app.use(getWidgets(app))

// widget route
app.get('/widget/:id', widgetsController.show)
app.get('/widget/:id/preview', widgetsController.preview)

// admin route
app.get('/', dashboardController.index)
app.get('/widgets', widgetsController.index)
app.get('/widgets/:id', widgetsController.detail)
app.post('/widgets/:id', widgetsController.saveSetting)
app.patch('/widgets/:id', widgetsController.saveSetting)

module.exports = app;