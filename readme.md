# CERN OAuth 2.0 SSO NodeJS Proxy

This will run on OpenShift as a proxy to your application (which can run on OpenStack).

It takes care of authenticating users using OAuth 2.0 and in the headers you get the egroups the user belongs to, the id and the displayname.

If you include an API_URL environment variable, it will also route /api/\* to the API_URL (with all HTTP possible methods, GET, POST, PUT, ...)

## Instructions

1. Request a webpage in: [https://webservices.web.cern.ch/webservices/](CERN Web Services).
2. Set up the visibility to Internet in 'Site Access & Permissions'.
3. Go to 'manage your site', under OpenShift application tools, it will open on OpenShift.
4. Click on Nodejs instance ![nodejs instance selection](https://github.com/fabioespinosa/cern-oauth2-sso-node-proxy/blob/master/readme_images/2.png 'Nodejs container')
5. Input the address of this exact repo in Git Repository ![git repository](https://github.com/fabioespinosa/cern-oauth2-sso-node-proxy/blob/master/readme_images/3.png 'git repository link')
6. After your project shows up in the Overview panel, click on it and under the Environment tab, add the info you got from [https://sso-management.web.cern.ch/OAuth/RegisterOAuthClient.aspx](CERN OAuth Registration) as environment variables, as shown in the image: ![Open Shift env variables](https://github.com/fabioespinosa/cern-oauth2-sso-node-proxy/blob/master/readme_images/4.png 'Open Shift env variables')
7. Wait until the container runs again, and it should be working.

| Environment Variable | Required | Explanation                                                                                                                                                                    |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CLIENT_URL           | true     | The URL you want to proxy                                                                                                                                                      |
| clientID             | true     | The client id you get from [https://sso-management.web.cern.ch/oauth/registeroauthclient.aspx](CERN AUTH)                                                                      |
| clientSecret         | true     | The client secret you get from [https://sso-management.web.cern.ch/oauth/registeroauthclient.aspx](CERN AUTH)                                                                  |
| callbackURL          | true     | The name of your proxy with '/callback' in the end. The proxy will handle this route, no need to set it up yourself                                                            |
| authorizationURL     | false    | You might not need to change this, it defaults to https://oauth.web.cern.ch/OAuth/Authorize                                                                                    |
| tokenURL             | false    | You might not need to change this, it defaults to https://oauth.web.cern.ch/OAuth/Token                                                                                        |
| API_URL              | false    | If you're also running an API and you want to re-use this proxy, passing this env. variable will make all requests that go to the proxy/api/\* go to the API_URL you provided. |
