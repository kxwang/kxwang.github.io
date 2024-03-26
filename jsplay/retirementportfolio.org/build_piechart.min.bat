type piedata.js pdfPortfolio.js piechart.js > pieboth.js
call uglifyjs pieboth.js -o piechart.min.js -m sort,toplevel --screw-ie8 -c drop_console -r "formatExpenseRatio"
del pieboth.js
copy /Y piechart.html index.html
