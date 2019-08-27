const axios = require('axios');
const queryString = require('querystring');

module.exports = class CAppAuth {
    constructor(authEndpoint, clientId, clientSecret, advanceRefresh) {
        this.authServer = axios.create({
            baseURL: authEndpoint
        });
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.advanceRefresh = advanceRefresh;
    }

    GetToken() {
        return this.token;
    }

    Revoke() {
        this.authServer.post(
            '/revoke',
            queryString.stringify(Object.assign({}, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                token: this.token
            })),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
            .then(() => {
                console.log('Token revoked')
            })
            .catch((err) => {
                console.log('Could not revoke token: ' + err);
            })
    }

    SetTokenRefreshedCallback(callback) {
        this.tokenRefreshCallback = callback;
    }

    refresh() {
        this.authServer.post(
            '/token',
            queryString.stringify(Object.assign({}, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken
            }, {grant_type: 'refresh_token'})),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
            .then((response) => {
                this.saveToken(response.data);
            })
            .catch((err) => {
                console.log(err);
                // try to refresh in one second
                setTimeout(this.refresh.bind(this), 1000);
            })
    }

    saveToken(data) {
        console.log('NEW TOKEN SAVED');
        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        setTimeout(this.refresh.bind(this), data.expires_in*1000*this.advanceRefresh);
        if (this.tokenRefreshCallback !== undefined && typeof this.tokenRefreshCallback === 'function') {
            this.tokenRefreshCallback(this.token);
        }
    }
}