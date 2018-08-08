import chalk from 'chalk';

export default function toast() {
    const title = 'Rebilly Report Data Downloader';
    const line = '═'.repeat(title.length);
    console.log(chalk.magenta.bold(`
    ${line}
    ${title}
    ${line}
    `));
}
