# Simple HTTP Connector For Flows

This app let you run HTTP requests from flows. Responses are ignored.

### Trigger cards:
- Incoming GET request
 - http:\\\\[YourHomeyIP]:9090\\[name]
 - http:\\\\[YourHomeyIP]:9090\\[name]\\[value] if you use the value token

### Condition cards:
- HTTP Get Response: Checks the HTTP response code of a GET Request.
- HTTP Get JSON Response: Variant with query parameters.

### Action cards:
- HTTP Delete
- HTTP Get
- HTTP Get JSON (for query parameters like ?a=1&b=zz use {"a": 1, b: "zz"})
- HTTP Put JSON
- HTTP Post JSON

Passing of a valid JSON string (at least {} ) is obligatory for cards with a JSON parameter.
 Happy hacking!
