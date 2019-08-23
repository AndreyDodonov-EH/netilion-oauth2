const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CAppAuth extends CAuth {
    constructor() {
        super(process.env.APP_AUTH_ENDPOINT);
    }

    Authenticate() {
        return new Promise((resolve, reject) => {
            this.authServer.post(
                '/token',
                queryString.stringify(Object.assign({}, {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    username: process.env.TECH_USER,
                    password: process.env.TECH_PASS
                }, {grant_type: 'password'})),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
                .then((response) => {
                    this.saveToken(response.data);
                    resolve();
                })
                .catch((err) => {
                    console.log(err);
                    reject();
                })
        });
    }
}