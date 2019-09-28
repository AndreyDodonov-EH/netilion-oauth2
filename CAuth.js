const axios = require('axios');
const queryString = require('querystring');

module.exports = class CAppAuth {
    constructor(authEndpoint, clientId, clientSecret, autoRefresh, advanceRefresh) {
        this.authServer = axios.create({
            baseURL: authEndpoint
        });
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.autoRefresh = autoRefresh;
        this.advanceRefresh = advanceRefresh;
    }

    GetToken() {
        return this.token;
    }

    GetRefreshToken() {
        return this.refreshToken;
    }

    Revoke() {
        return new Promise ((resolve, reject) => {
            this.authServer.post(
                '/revoke',
                queryString.stringify(Object.assign({}, {
                    token: this.refresh_token
                })),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
                .then((data) => {
                    console.log('Refresh token revoked');
                    this.authServer.post(
                        '/revoke',
                        queryString.stringify(Object.assign({}, {
                            token: this.token
                        })),
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        })
                        .then((data) => {
                            console.log('Token revoked');
                            resolve();
                        })
                        .catch((err) => {
                            console.log('Could not revoke token: ' + err);
                            reject(err);
                        })
                })
                .catch((err) => {
                    console.log('Could not revoke refresh token: ' + err);
                    reject(err);
                })
        });
    }

    SetTokenRefreshedCallback(callback) {
        this.tokenRefreshCallback = callback;
    }

    Refresh(rfrToken) {
        return new Promise ((resolve, reject) => {
            this.authServer.post(
                '/token',
                queryString.stringify(Object.assign({}, {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: rfrToken
                }, {grant_type: 'refresh_token'})),
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
                    reject(err);
                })
        });
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
                if (this.autoRefresh === true) {
                    this.saveToken(response.data);
                }
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