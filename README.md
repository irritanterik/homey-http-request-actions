# Simple HTTP Connector For Flows
Start a flow with a simple HTTP Get request, use HTTP response codes as a flow
condition or execute HTTP requests as a flow action with this app.

Happy hacking!  

If you like the app, buy me a beer!

## Trigger cards
**Incoming GET**  (*T20*)  
Trigger a flow by sending a GET request to one of the next API-endpoints:
- `http://<LocalIP>/api/app/com.internet/:event:`
- `http://<LocalIP>/api/app/com.internet/whitelist/:event:`
- `https://<AthomCloudId>.connect.athom.com/api/app/com.internet/:event:`

Add `/:value:` if you want to pass a value to the trigger card, this will make it available in the 'value'-token. All values will be defined as strings. Example: `http://192.168.0.100/api/app/com.internet/whitelist/externallights/on`
Get your `<AthomCloudId>` from http://developer.athom.com/tools/system

Configure your authorization and whitelists preferences on the settings page.
*** WHITELISTING IS NOT FUNCTIONAL IN HOMEY V2 ***

**Incoming POST** (*T30*)  
Trigger a flow by sending a POST request to one of the API-endpoints a specified above. The posted body will be available in the 'JSON'-token. This token can be used on cards *C80*, *A80* and *A81*.

**JSONpath value** (*T80*)  
Trigger a flow from cards *A23* and *A81* by using the same value in the 'trigger'-field.

**JSON object** (*T81*)  
Trigger a flow from card *A24* by using the same value in the 'trigger'-field.

## Condition cards
**GET code equation** (*C20*)  
Checks the HTTP response code of a GET request.
Timeouts return response code 1, other errors return response code 0.

**GET (query) code equation** (*C21*)  
Checks the HTTP response code of a GET request. Specify query parameters in JSON format.
Timeouts return response code 1, other errors return response code 0.

**GET JSONpath equation** (*C22*)  
Extract and check a specific value from a JSON or XML formatted GET response. This card expects a JSONpath expression.

**JSONpath equation** (*C80*)  
Extract and check a specific value from the JSON token available on cards *T30* and *T81*.

## Action cards
**DELETE** (*A10*)  
Execute a DELETE request

**GET** (*A20*)  
Execute a standard GET request. This is the most common action.  

**GET (query)** (*A21*)  
For query parameters like ?a=1&b=zz use `{"a":1,"b":"zz"}`  

**GET JSONpath trigger value** (*A23*)  
Extract a value from a JSON or XML formatted GET response and trigger other flows with this value available as a token (card *T80*).

**GET JSON trigger object** (*A24*)  
Trigger other flow with the JSON or XML formatted response of this request. The result will be available as a token in JSON format (card *T81*).

**POST form** (*A30*)  
Execute a POST with form data (content-type 'application/x-www-form-urlencoded')

**POST JSON** (*A31*)  
Execute a POST with json data (content-type 'application/json')

**POST XML** (*A32*)  
Execute a POST with XML data (content-type 'application/xml')  

**PUT JSON** (*A40*)  
Execute a PUT with json data

**WebSocket send** (*A70*)  
Open a WebSocket and send data.

**JSONpath for trigger** (*A81*)  
Extract a value from the JSON token available on card *T30* and trigger other flows with this value available as a token (card *T80*)

**Depricated geek card** (*A90*)  
Please don't use this card, it's depricated as HTTP options can be used on every card with a 'url' parameter

## Notes   
Requests will time-out after 30 seconds.
Passing a valid JSON string (at least `{}` ) is obligatory for cards with a JSON parameter.

#### More information on JSON and JSONpath expressions
When in doubt validate your JSON values for flow cards with [jsonlint.com](http://jsonlint.com/).
Check your JSONpath expressions with [jsonpath.com](http://jsonpath.com/).
If you're using JSONpath expressions on XML responses, be aware of the XML to JSON conversion. This conversion can be simulated on [RunKit.com](https://runkit.com/585436e8fcbda700135741a7/586d421e08e18e001389a004) with the xml2js module.


#### Advanced HTTP options
  Instead of an url you can also provide a valid json with [node http options](https://nodejs.org/api/http.html#http_http_request_options_callback) in *every* card with a url parameter. These options will override options defined by the card to ensure maximal flexibility. Example with headers:
  ```
  {"method":"put","protocol":"https:","hostname":"httpbin.org","path":"/put","headers":{"user-agent":"Node.js http.min"}}
  ```

#### Authorization on API calls
  API calls requires header `Authorization` with value `Bearer <token>`, where `<token>` is your secret token.  
  *(Discover your bearer token by enabling the Chrome Console (F12) and open the 'Network' tab. Now navigate to https://developer.athom.com/tools/system. Inspect the network traffic and look for the authorization header. It contains 'Bearer 123verylongcode456')*

  Configure your authorization and whitelists preferences on the settings page.
