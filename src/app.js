import axios from 'axios';
import inquirer from 'inquirer';
import Multispinner from 'multispinner';
import parseUrl from './parse-url';

export default function app() {
    const api = axios.create({
        headers: {'REB-APIKEY': process.env.APIKEY},
        timeout: 60000,
    });

    const fetchAmount = {
        all: 'all',
        custom: 'custom',
    };

    const spinnerConfig = {
        color: {
            incomplete: 'yellow',
        },
        autoStart: false,
        clear: true,
    };

    const questions = [
        {
            type: 'input',
            name: 'url',
            message: `What's the url of the report including the date range`,
            default: `http://api.dev-local.rebilly.com/experimental/reports/transactions?aggregationField=website&periodStart=2018-08-01T00:00:00-04:00&periodEnd=2018-08-08T23:59:59-04:00&limit=20&offset=0&tz=-240`,
        },
        {
            type: 'list',
            name: 'fetchAmount',
            message: `How many records to fetch`,
            choices: [
                {name: 'All', value: fetchAmount.all},
                {name: 'Custom amount', value: fetchAmount.custom},
            ],
        },
    ];

    const customAmountQuestion = [
        {
            type: 'input',
            name: 'amount',
            message: `How many records to fetch`,
            default: 1000,
        },
    ];

    (async () => {
        let amount = fetchAmount.all;
        const answers = await inquirer.prompt(questions);
        if (answers.fetchAmount !== fetchAmount.all) {
            const newStep = await inquirer.prompt(customAmountQuestion);
            amount = newStep.amount;
        }
        const spinners = new Multispinner(['requests'], Object.assign({}, spinnerConfig, {
            preText: 'Calculating',
        }));
        const urlBuilder = parseUrl(answers.url);

        urlBuilder.setLimit(1);

        try {
            spinners.start('requests');
            const response = await api.get(urlBuilder.build());
            spinners.success('requests');
            
        } catch (err) {
            spinners.error('requests');
            console.log(err);
        }
    })();
}
