# RetirementPortfolio.org calculator

## Development

1. Install express local to the project
    
    `npm install`

1. start the server
    
    `node server.js`

1. Open the static version of the page

    open http://localhost:3000/piechart.dev.html

For the iOS no-ui version, use 

    open http://localhost:3000/piechart.no-ui.html

## Building for iOS

    cat basicHttp/no-ui-stubs.js basicHttp/lib/knockout-min.js basicHttp/piedata.js basicHttp/piechart.js > calculator.js
    cp calculator.js ../Retirement\ Calculator/Retirement\ Calculator/calculator.js