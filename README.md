# Simple HTTP Connector For Flows

Start a flow with a simple HTTP Get request, use HTTP response codes as a flow
condition or execute HTTP requests as a flow action with this app.

### Trigger cards
- Incoming GET requests
 - `http://<YourHomeyIP>/api/app/com.internet/<event>`
 - `http://<YourHomeyIP>/api/app/com.internet/<event>/<value>` will put a value in the 'value'-token of this card.
 - for external access use `https://<YourId>.homey.athom.com/api/app/com.internet/<event>`
 - allow unauthorized request from local IPs based on the whitelist setting via whitelisted endpoints: `http://<YourHomeyIP>/api/app/com.internet/whitelist/<event>` and `http://<YourHomeyIP>/api/app/com.internet/whitelist/<event>/<value>`
 - GET variable step 2 (read 'get variable and trigger flow')

### Condition cards
- Get Response: Checks the HTTP response code of a GET Request.
- Variable condition (based on 'get variable and trigger flow')
- Get JSON Response: Variant with query parameters.

### Action cards
- HTTP Delete
- HTTP Get
- DEPRICATED: HTTP Get JSON (for query parameters like ?a=1&b=zz use `{"a":1,"b":"zz"}`, will be removed in a next version. Queryparameters can now be used with the HTTP Get card)
- HTTP Put JSON
- HTTP Post Form (content-type 'application/x-www-form-urlencoded', JSON formatted)
- HTTP Post JSON (content-type 'application/json')
- WebSocket Send (message to ws://x.x.x.x:y endpoint)
- GET variable step 1 (read 'get variable and trigger flow')
- GET variable Better Logic (read 'get variable and set Better Logic variable')
- DEPRICATED: HTTP Geek Request (Will be removed in next version)

## Get variable and trigger a flow with it
The paired action and trigger cards GET variable step 1/2 enables you to get a value from any JSON-formatted or XML-formatted get response and start a flow with the retrieved value as a token.

The action card has four parameters:
 1. Url (could also be a [node http options](https://nodejs.org/api/http.html#http_http_request_options_callback) object)
 2. JSON encoded query parameters: ?a=1&b=zz use `{"a":1,"b":"zz"}`)
 3. [JSONpath formatted](http://jsonpath.com/) expression of desired value. The result of this expression must be a single value.
 4. Name of trigger/event for step 2

When this cards executes succesfull, it will start flows with the 'GET variable step 2' trigger card and same trigger/event as step 1. The result of the JSONpath expression is available as a token on the card.

## Get variable and set a Better Logic variable with it
The action card 'GET variable Better Logic' enables you to get a variable online from a JSON- or XML-formatted response on a get request and set this variable on a string variable in the Better Logic app.

The action card has three parameters:
 1. Url (could also be a [node http options](https://nodejs.org/api/http.html#http_http_request_options_callback) object)
 2. [JSONpath formatted](http://jsonpath.com/) expression of desired value. The result of this expression must be a single value.
 3. Name of Better Logic variable (variables with type string supported)

Happy hacking!
[Donate with PayPal](http://PayPal.Me/ErikvanDongen).

#### Notes   
  Requests will time-out after 30 seconds.
  Passing a valid JSON string (at least `{}` ) is obligatory for cards with a JSON parameter.

###### Advanced HTTP options
  Instead of an url you can also provide a valid json with [node http options](https://nodejs.org/api/http.html#http_http_request_options_callback) in *every* card. These options will override options defined by the card to ensure maximal flexibility. Example with headers:
  ```
  {"method":"put","protocol":"https:","hostname":"httpbin.org","path":"/put","headers":{"User-Agent":"Node.js http.min"}}
  ```

###### Authorization on API calls
  API calls requires header `Authorization` with value `Bearer <token>`, where <token> is your secret token (get it by typing `window.bearer_token` in the chrome console while logged in on your Homey). This can be disabled in the settings screen of this app.
