const axios = require('axios');
const queryString = require('querystring');

// THIS HAS TO BE USED AT LEAST ONCE TO ACCESS process.env
const config = require('../env');

module.exports = class CAppAuth {
    constructor(baseURL) {
        this.authServer = axios.create({
            baseURL: baseURL
        });
    }

    GetToken() {
        return this.token;
    }

    Revoke() {
        this.authServer.post(
            '/revoke',
            queryString.stringify(Object.assign({}, {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
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
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
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
        setTimeout(this.refresh.bind(this), data.expires_in*1000*process.env.ADVANCE_REFRESH);
        if (this.tokenRefreshCallback !== undefined && this.tokenRefreshCallback === 'function') {
            this.tokenRefreshCallback(this.token);
        }
    }
}