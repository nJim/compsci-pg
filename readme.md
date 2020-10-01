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
