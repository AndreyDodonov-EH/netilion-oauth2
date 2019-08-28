const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CAppAuth extends CAuth {
    constructor(authEndpoint, clientId, clientSecret, techUser, techPass, autoRefresh, advanceRefresh) {
        super(authEndpoint, clientId, clientSecret, autoRefresh, advanceRefresh);
        this.techUser = techUser;
        this.techPass = techPass;
    }

    Authenticate() {
        return new Promise((resolve, reject) => {
            this.authServer.post(
                '/token',
                queryString.stringify(Object.assign({}, {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    username: this.techUser,
                    password: this.techPass
                }, {grant_type: 'password'})),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
                .then((response) => {
                    if (this.autoRefresh === true) {
                        this.saveToken(response.data);   
                    }
                    resolve(response.data);
                })
                .catch((err) => {
                    console.log(err);
                    reject();
                })
        });
    }
}