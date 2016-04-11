# Simple HTTP Connector For Flows

Start a flow bij a simple HTTP Get request, use HTTP response codes as a flow
condition or execute a HTTP request as a flow action with this app.

### Trigger cards
- Incoming GET requests
 - ```http://<YourHomeyIP>/api/app/com.internet/<event>```
 - ```http://<YourHomeyIP>/api/app/com.internet/<event>/<value>``` will put a value in the 'value'-token of this card.
- GET variable step 2 (read 'get variable and trigger flow')

### Condition cards
- HTTP Get Response: Checks the HTTP response code of a GET Request.
- HTTP Get JSON Response: Variant with query parameters.

### Action cards
- HTTP Delete
- HTTP Get
- HTTP Get JSON (for query parameters like ?a=1&b=zz use {"a":1,"b":"zz"})
- HTTP Put JSON
- HTTP Post Form (content-type 'application/x-www-form-urlencoded')
- HTTP Post JSON (content-type 'application/json')
- HTTP Geek Request (for real geeks using [node http options](https://nodejs.org/api/http.html#http_http_request_options_callback))
- WebSocket Send (message to ws://x.x.x.x:y endpoint)
- GET variable step 1 (read 'get variable and trigger flow')

## Get variable and trigger a flow with it
The paired action and trigger cards GET variable step 1/2 enables you to get a value from any JSON-formatted get request and start a flow with the retrieved value as a token.

The action card has four parameters:
 1. Url
 2. JSON encoded query parameters: ?a=1&b=zz use {"a":1,"b":"zz"})
 3. [JSONpath formatted](http://jsonpath.com/) expression of desired value. The result of this expression must be a single value.
 4. Name of trigger/event for step 2

When this cards executes succesfull, it will start flows with the 'GET variable step 2' trigger card and same trigger/event as step 1. The result of the JSONpath expression is available as a token on the card.

#### Note   
  Passing a valid JSON string (at least {} ) is obligatory for cards with a JSON parameter.
    Happy hacking!
