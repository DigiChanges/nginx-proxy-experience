const { exec } = require('child_process');
const { domains, emailRenew} = require('./config');

let ds = '';

for (const domain of domains)
{
    ds += `-d ${domain.serverName} `
}

const command = `certbot certonly --webroot --email ${emailRenew} --agree-tos --no-eff-email --webroot-path=/usr/share/nginx/html ${ds}`

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
         return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
