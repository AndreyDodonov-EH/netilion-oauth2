const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CUserAuth extends CAuth{
    constructor() {
        super(process.env.USER_AUTH_ENDPOINT);
    }

    Authenticate(appToken, authorization_code) {
        return new Promise((resolve, reject) => {
            this.authServer.post
            ('/token',
                queryString.stringify(Object.assign({}, {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    code: authorization_code,
                    redirect_uri: process.env.REDIRECT_URI
                }, {grant_type: 'authorization_code'})),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + appToken
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