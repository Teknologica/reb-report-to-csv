import axios from 'axios';
import inquirer from 'inquirer';
import Multispinner from 'multispinner';
import chalk from 'chalk';
import parseUrl from './parse-url';

export default function app() {
    const api = axios.create({
        headers: {'REB-APIKEY': process.env.APIKEY},
        timeout: 60000,
    });

    const baseLimit = 1000;

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
            default: ``,
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
        let totalRecords;
        const answers = await inquirer.prompt(questions);
        if (answers.fetchAmount !== fetchAmount.all) {
            const newStep = await inquirer.prompt(customAmountQuestion);
            amount = newStep.amount;
        }
        const firstSpinner = new Multispinner(['requests'], Object.assign({}, spinnerConfig, {
            preText: 'Calculating',
        }));
        const urlBuilder = parseUrl(answers.url);

        urlBuilder.setLimit(1);

        try {
            firstSpinner.start('requests');
            const response = await api.get(urlBuilder.build());

            totalRecords = Number(response.headers['pagination-total']);
            firstSpinner.success('requests');
            setTimeout(async () => {
                console.log(chalk.green(`Found ${totalRecords} record${totalRecords === 1 ? '' : 's'} for request.`));
                if (totalRecords > 0) {
                    if (amount !== fetchAmount.all) {
                        // restrict amount if needed
                        totalRecords = Number(amount);
                    }
                    const fetches = Math.ceil(totalRecords / baseLimit);
                    const concurrentMax = 5;
                    const steps = Math.ceil(fetches / concurrentMax);
                    let target = concurrentMax * baseLimit;
                    if (target > totalRecords) {
                        target = totalRecords;
                    }
                    let step = 0;
                    const process = async () => {
                        step += 1;
                        const promiseCount = Math.ceil(target / baseLimit);

                        try {
                            const promises = Array.from(new Array(promiseCount)).map((e, i) => {

                                return () => {
                                    return i;
                                };
                            });
                            const result = await Promise.all(promises);

                        } catch (e) {
                            console.log(e);
                        }
                        if (step < steps) {
                            await process();
                        }
                    };
                    await process();
                }
            }, 100);

        } catch (err) {
            firstSpinner.error('requests');
            console.log(err);
        }
    })();
}
