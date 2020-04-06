const queryString = require('querystring');
const CAuth = require('./CAuth');

module.exports = class CUserAuth extends CAuth{
    constructor(authEndpoint, clientId, clientSecret, redirectUri, autoRefresh, advanceRefresh) {
        super(authEndpoint, clientId, clientSecret, autoRefresh, advanceRefresh);
        this.redirectUri = redirectUri;
    }

    Authenticate(authorization_code) {
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

    Logout(token) {
        return new Promise((resolve, reject) => {
            this.authServer.post
            ('/revoke',
                queryString.stringify(Object.assign({}, {
                    token: token
                })),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    console.log(err);
                    reject();
                })
        });
    }

}