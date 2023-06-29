# CERN OAuth 2.0 SSO NodeJS Proxy

This will run on OpenShift as a proxy to your application (which can run on OpenStack).

It takes care of authenticating users using keycloack/OIDC, getting their id, email, name and roles 
and passing them onto the application running on CLIENT_URL.

If you include an API_URL environment variable, it will also route `/api/\*` to the API_URL (with all HTTP possible methods, `GET`, `POST`, `PUT`, ...)

Note: Roles are different from egroups. See [here](https://auth.docs.cern.ch/applications/role-based-permissions/) for details.

## Instructions

1. Request a webpage in: [CERN Web Services](https://webservices.web.cern.ch/webservices/).
2. Set up the visibility to Internet in 'Site Access & Permissions'.
3. Go to 'manage your site', under OpenShift application tools, it will open on OpenShift.
4. Click on Nodejs instance ![nodejs instance selection](doc/3.png 'Nodejs container')
5. Input the address of this exact repo in Git Repository ![git repository](doc/2.png 'git repository link')
6. After your project shows up in the Overview panel, click on it and under the Environment tab, add the info you got from [CERN OAuth Registration](https://sso-management.web.cern.ch/OAuth/RegisterOAuthClient.aspx) as environment variables, as shown in the image: ![Open Shift env variables](doc/4.png 'Open Shift env variables')
7. Wait until the container runs again, and it should be working.

## Environment Variables

Environment variables that configure the proxy's execution. You can set those either by running `export <VAR>=<VALUE>` or by setting them in an `.env` file. See [`.env_sample`](.env_sample).

| Environment Variable | Required | Description |
| -------------------- | -------- | ------------------------- |
| `CLIENT_URL`    | true     | The URL you want to proxy |
| `CLIENT_ID`     | true     | The client id you get from [CERN AUTH](https://sso-management.web.cern.ch/oauth/registeroauthclient.aspx) |
| `CLIENT_SECRET` | true     | The client secret you get from [CERN AUTH](https://sso-management.web.cern.ch/oauth/registeroauthclient.aspx) |  
| `API_URL`       | false    | If you're also running an API and you want to re-use this proxy, passing this environment variable will redirect all requests that go to the proxy's `/api/\*` endpoint to the `API_URL` you provided. |
| `SERVER_PORT`   | false    | The port that the proxy listens to, defaults to `8080` |
| `SERVER_TIMEOUT`| false    | The server's timeout in ms, see [here](https://nodejs.org/api/http.html#serversettimeoutmsecs-callback) | 
| `ENV`           | false    | The type of environment the proxy is running to. Set to `development` for extra console messages. | 
| `DEBUG`         | false    | Accepts a comma-separated list of node modules to enable debugging information for. Example value: `http,express:*` to enable debugging messages for `http` and `express`. |
| `NODE_ENV`      | false    | Sets the mode for the `express` server. Set to `development` when developing. ` |

More env vars (such as `NPM_RUN` which lets you specify the `npm run` command to run), specific to the NodeJs S2I image can be found [here](https://github.com/sclorg/s2i-nodejs-container/tree/master/14#readme).