const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const chalk = require('chalk');

const initDb = require('./startUp/initDb');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', routes);

const PORT = process.env.PORT || config.get('PORT') || 8080;

// if (process.env.NODE_ENV === 'production') {
//   console.log('>>>>>> PROD');
// } else if (process.env.NODE_ENV === 'development') {
//   console.log('====== DEV');
// } else {
//   console.log('process.env.NODE_ENV', process.env.NODE_ENV);
// }

const start = async () => {
  try {

    mongoose.connection.once('open', () => {
      initDb();
    });

    await mongoose.connect(config.get('MONGO_URI')).then(() => console.log(chalk.green(`Mongo connected`)));

    app.listen(PORT, () => console.log(chalk.green(`Server has been started on port ${PORT}`)));

  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
}

start();