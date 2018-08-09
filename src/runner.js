import axios from 'axios';
import inquirer from 'inquirer';
import Multispinner from 'multispinner';
import chalk from 'chalk';
import parseUrl from './parse-url';
import questions from './questions';
import amounts from './amounts';

export default class Runner {
    constructor(concurrentCalls = 3) {
        this.total = 0;
        this.limit = 1000;
        this.offset = 0;
        this.desiredAmount = null;
        this.url = null;
        this.index = 0;
        this.downloadLimit = 0;
        this.concurrentCalls = concurrentCalls;
        this.data = [];
        (async () => {
            this.makeApiClient();
            await this.init();
        })();
    };

    makeApiClient() {
        this.api = axios.create({
            headers: {'REB-APIKEY': process.env.APIKEY},
            timeout: 60000,
        });
    }

    async init() {
        const {url, fetchAmount} = await inquirer.prompt(questions.first);
        this.url = parseUrl(url, this.limit);
        this.desiredAmount = fetchAmount;
        if (this.desiredAmount !== amounts.all) {
            const {amount} = await inquirer.prompt(questions.second);
            this.desiredAmount = amount;
        } else {
            this.desiredAmount = null;
        }
        await this.getTotal();
        await this.startDownload();
        this.processData();
    }

    async getTotal() {
        this.url.setLimit(1);
        const response = await this.api.get(this.url.build());
        this.total = Number(response.headers['pagination-total']);
        console.log(chalk.green(`Found ${this.total} record${this.total === 1 ? '' : 's'} for download.`));
        if (!this.desiredAmount) {
            // set the desired amount to the maximum
            // if the value was previously `all`
            this.desiredAmount = this.total;
        }
    }

    async startDownload() {
        this.url.setLimit(this.limit);
        this.downloadLimit = Math.ceil(this.desiredAmount / this.limit);
        await this.download(0);
    }

    async download(startIndex) {
        const endIndex = startIndex + this.concurrentCalls > this.downloadLimit
            ? this.downloadLimit
            : startIndex + this.concurrentCalls;
        const promises = [];
        for (let index = startIndex; index < endIndex; index++) {
            this.url.setOffset(index * this.limit);
            promises.push(async () => {
                const {headers, data} = await this.api.get(this.url.build());
                console.log(headers['pagination-total']);
                return {foo:'bar'};
            });
        }
        const data = await Promise.all(promises);
        this.data = this.data.concat(data);
        if (endIndex > this.downloadLimit) {
            // continue
            await this.download(endIndex);
        }
    }

    processData() {
        console.log(JSON.stringify(this.data));
    }
}


