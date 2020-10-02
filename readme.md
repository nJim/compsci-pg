# Getting Started with IBM Cloud Functions

## Setup

- [Register for an account](https://console.bluemix.net/registration/) with the lite option (no CC required)
- Instal the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/reference/bluemix_cli/download_cli.html#download_install) tools
- Login via CLI and make sure to set the correct region <br />
  `ibmcloud login`
- Install the cloud functions plugin <br />
  `ibmcloud plugin install cloud-functions`
- Test the connection by invoking a function
  `ibmcloud fn action invoke whisk.system/utils/echo -p message hello --result`

## Introduction

Actions are stateless code snippets that run on the OpenWhisk platform. An action can be written as a JavaScript, Swift, PHP, or Python function, a Java method, static binary or a custom executable packaged in a Docker container.

Actions can be explicitly invoked, or run in response to an event. In either case, each run of an action results in an activation record that is identified by a unique activation ID. Actions can also be composed of calls to other actions or a defined sequence of actions.

## Creating and Updating Actions

By convention main() provides the entry point for the action.

```js
function main(params) {
    ...
}
```

Useful CLI commands:

```bash
# Create an action.
ibmcloud fn action create actionName fileName.js
# Update an action.
ibmcloud fn action update actionName fileName.js
# List all actions.
ibmcloud fn action list
```

## Invoking Actions

Invoking an action will return an activation id for the instance of that invocation. This id can be used to retrieve the results and other details.

```bash
# Invoke an action.
ibmcloud fn action invoke actionName
# Invoke an action with params.
ibmcloud fn action invoke actionName --param name value
# Setting default parameters when updating an action.
ibmcloud fn action update actionName --param name value
# Invoke an action with params in a JSON file.
ibmcloud fn action invoke --result actionName --param-file parameters.json
```

### Reviewing Activations and Results

```bash
# Review an activation.
ibmcloud wsk activation get activationId
# Review the result of an activation.
ibmcloud wsk activation result activationId
# Review the result of the last activation.
ibmcloud wsk activation result --last
# List recent activations.
ibmcloud wsk activation list
# Continuously poll activations list.
ibmcloud wsk activation poll
```

A blocking invocation request will wait for the activation result to be available. The wait period is the lesser of 60 seconds or the action's configured time limit.

```bash
# Return activation once result is available.
ibmcloud fn action invoke --blocking actionName
# Return activation result.
ibmcloud fn action invoke --result actionName
```

### Calling Actions from Actions

Rather than having to manually construct the HTTP requests to invoke actions from within the IBM Cloud Functions runtime, client libraries are pre-installed to make this easier.

```bash
var openwhisk = require('openwhisk');

function main(params) {
  var ow = openwhisk();
  ow.actions.invoke({
    name: actionName,
    blocking: true,
    result: true,
    params: params
  });
}
```

### Asynchronous Actions

```js
function main(args) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve({ done: true });
    }, 2000);
  });
}
```

Actions have a timeout parameter that enforces the maximum duration for an invocation. This value defaults to 60 seconds and can be changed to a maximum of 5 minutes.

```bash
# Increase the default timeout for an action.
ibmcloud fn action update actionName --timeout 1000
```

## Packages

Packages can bundle together related actions and also share them with the community.

- Packages can only contain actions. Triggers and rules are not supported at the moment.
- Packages support default parameters.
- Package nesting is not allowed.

### IBM Public Packages

```bash
# List system packages
ibmcloud fn package list /whisk.system
/whisk.system/combinators
/whisk.system/websocket
/whisk.system/watson-translator
/whisk.system/watson-textToSpeech
/whisk.system/github
/whisk.system/utils
/whisk.system/watson-speechToText
/whisk.system/slack
/whisk.system/samples
/whisk.system/weather
/whisk.system/pushnotifications
/whisk.system/alarms
/whisk.system/cloudant
/whisk.system/messaging

# Get a description of the package binding.
ibmcloud fn package get --summary /whisk.system/cloudant
package /whisk.system/cloudant: Cloudant database service
   (parameters: *apihost, *bluemixServiceName, *dbname, *host, overwrite, *password, *username)
 action /whisk.system/cloudant/read: Read document from database
   (parameters: dbname, id, params)
  action /whisk.system/cloudant/write: Write document in database
   (parameters: dbname, doc)
   ....
```

Parameters listed under the package with a prefix _ are predefined, bound parameters. Parameters without a _ are those listed under the annotations for each entity. Furthermore, any parameters with the prefix \*\* are finalized bound parameters. This means that they are immutable, and cannot be changed by the user.

### Creating and Using Package Bindings

Although you can use the entities in a package directly, you might find yourself passing the same parameters to the action every time. You can avoid this by binding to a package and specifying default parameters. These parameters are inherited by the actions in the package.

```bash
# Bind the samples packages.
ibmcloud fn package bind /whisk.system/samples myPackage
# Invoke an action in the package binding.
ibmcloud fn action invoke --result myPackage/greeting --param name Jim
```

### Creating Packages

```bash
# Create a package.
ibmcloud fn package create custom
# Get the summary of the package.
ibmcloud fn package get --summary custom
# Use the package name as a namespace. Example:
ibmcloud fn action create custom/getWeather getWeather.js
# Share the package.
ibmcloud fn package update custom --shared yes
```

## Triggers and Rules

_Not enough time to include this in practice group._

## Web UI

[Login to the Cloud Console](https://cloud.ibm.com/login) to find a list of all IBM Cloud resources associated with your account. This includes an interface for all 'Functions' including actions, triggers, and APIs.

- Functions can be invoked from the Web UI.
- Simply cloud functions can be edited in a text editor.
- Sequences, Triggers, and API settings may be managed.

## Exposing APIs from Actions

Web actions can then be invoked through the public platform API using a HTTP request without user authentication.

- HTTP request parameters are automatically converted in event parameters.
- Values returned from the action are automatically serialised to a JSON response.
- An optional API Gateway handles capabilities like routing based on request properties (URI paths and HTTP method), user authentication, rate limiting and more

```bash
# The web action is enabled with a parameter.
ibmcloud fn action update actionName --web true
# Get the endpoint for a function.
ibmcloud fn action get actionName --url
```

The function can be invoked by sending request parameters as the actions params.

```bash
curl "https://...whatever-endpoint.../convertCtoF.json?temp=23"
{
  "temp": 73.4
}
```

### Content Extensions

Web actions invoked through the platform API need a content extension to tell the platform how to interpret the content returned from the action.

The platform supports the following content-types: .json, .html, .http, .svg or .text. If no content extension is provided, it defaults to .http which gives the action full control of the HTTP response.

```javascript
// HTTP Extensions example for creating a redirect.
function main() {
  return {
    headers: { location: "http://www.windows93.net/" },
    statusCode: 302,
  };
}
```

```bash
# Get the endpoint for http action.
ibmcloud fn action get redirect --url
```

```javascript
// HTML Extensions example delivering markup.
function main() {
  let html = "<html><body>Hello World!</body></html>";
  return {
    headers: { "Content-Type": "text/html" },
    statusCode: 200,
    body: html,
  };
}
```

```bash
# Get the endpoint for html action.
ibmcloud wsk action get html --url
```

```javascript
// JPEG  Extensions example encoded images.
function main() {
  let png = "<BASE64 ENCODED IMAGE STRING>";
  return {
    headers: { "Content-Type": "image/png" },
    statusCode: 200,
    body: png,
  };
}
```

```bash
ibmcloud fn action get image --url
```

### API Gateway

_There's a lot you can do on the command line; but checking out the web interface is a better place to get started._

## Serverless Framework

_Show example_
