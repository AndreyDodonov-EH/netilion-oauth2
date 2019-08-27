const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CAppAuth extends CAuth {
    constructor(authEndpoint, clientId, clientSecret, advanceRefresh, techUser, techPass) {
        super(authEndpoint, clientId, clientSecret, advanceRefresh);
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