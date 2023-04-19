/* eslint-disable no-console */
/* eslint-disable linebreak-style */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const nocache = require('nocache');

const app = express();
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const multer = require('multer');
const flash = require('connect-flash');
const AppError = require('./utilities/app.error');
const globalErrorHandler = require('./utilities/handler');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlparser: true,
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to mongoos'));
const userRoute = require('./routers/user');
const adminRoute = require('./routers/admin');

const fileStorage = multer.diskStorage({
  // Destination to store image
  destination: 'public/imagess',
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    // upload only png and jpg format

    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.set('layout', 'layouts/layout');
app.set('public', `${__dirname}/public`);
app.use(expressLayouts);
app.use(express.json());
app.use(express.static('public'));
app.use(multer({ storage: fileStorage, fileFilter }).fields([{ name: 'img' }, { name: 'images', maxCount: 5 }]));
// app.use(multer({storage:fileStorage,fileFilter:fileFilter}).array('images',4))

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'key', cookie: { maxAge: 6000000 }, resave: true, saveUninitialized: true,
}));
app.use(nocache());
app.use(flash());

// app.use(logger('dev'));

app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
const PORT = process.env.PORT || 3000;

// eslint-disable-next-line no-console
app.listen(PORT, console.log(`Server don start for port: ${PORT}`));
