const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CUserAuth extends CAuth{
    constructor(authEndpoint, clientId, clientSecret, advanceRefresh, redirectUri) {
        super(authEndpoint, clientId, clientSecret, advanceRefresh);
        this.redirectUri = redirectUri;
    }

    Authenticate(appToken, authorization_code) {
        return new Promise((resolve, reject) => {
            this.authServer.post
            ('/token',
                queryString.stringify(Object.assign({}, {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: authorization_code,
                    redirect_uri: this.redirectUri
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