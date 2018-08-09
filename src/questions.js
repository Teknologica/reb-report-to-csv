import amounts from './amounts';

const url = ``;
const questions = {
    first: [
        {
            type: 'input',
            name: 'url',
            message: `What's the url of the report including the date range`,
            default: url,
        },
        {
            type: 'list',
            name: 'fetchAmount',
            message: `How many records to fetch`,
            choices: [
                {name: 'All', value: amounts.all},
                {name: 'Custom amount', value: amounts.custom},
            ],
        },
    ],
    second: [
        {
            type: 'input',
            name: 'amount',
            message: `How many records to fetch`,
            default: 1000,
        },
    ],
};
export default questions;
