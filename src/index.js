import 'babel-polyfill';
import chalk from 'chalk';
import clear from 'clear';
import toast from './toast';
import Runner from './runner';

const start = () => {
    clear();
    toast();

    if (process.env.APIKEY === undefined) {
        console.log(chalk.bgRedBright.black('Missing API key. Please define one in the `.env` file.'));
    } else {
        new Runner();
    }
};

start();


