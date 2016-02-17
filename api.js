module.exports = [
    {
        description: "HTTP Get trigger card",
        method: 		"GET",
        path:			"/:event",
        requires_authorization: false,
        fn: function( callback, args ){
          Homey.app.trigger(args.params.event, null); //By version 0.8.19 direct call to flow manager and passing state object
          callback( null, "OK");
        }
    },
    {
        description: "HTTP Get trigger card with value",
        method: 		"GET",
        path:			"/:event/:value",
        requires_authorization: false,
        fn: function( callback, args ){
          Homey.app.trigger(args.params.event, args.params.value); //By version 0.8.19 direct call to flow manager and passing state object
          callback( null, "OK");
        }
    }
]
