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
