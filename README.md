# Simple HTTP Connector For Flows

Start a flow bij a simple HTTP Get request, use HTTP response codes as a flow
condition or execute a HTTP request as a flow action with this app.

### Trigger cards
- Incoming GET requests
 - ```http://<YourHomeyIP>/api/app/com.internet/<event>```
 - ```http://<YourHomeyIP>/api/app/com.internet/<event>/<value>``` will put a value in the 'value'-token of this card.

### Condition cards
- HTTP Get Response: Checks the HTTP response code of a GET Request.
- HTTP Get JSON Response: Variant with query parameters.

### Action cards
- HTTP Delete
- HTTP Get
- HTTP Get JSON (for query parameters like ?a=1&b=zz use {"a": 1, b: "zz"})
- HTTP Put JSON
- HTTP Post Form (content-type 'application/x-www-form-urlencoded')
- HTTP Post JSON (content-type 'application/json')
- WebSocket Send (message to ws://x.x.x.x:y endpoint)

Passing a valid JSON string (at least {} ) is obligatory for cards with a JSON parameter.
 Happy hacking!
