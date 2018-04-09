
Turf.js can do aggregation to show clusters. In order to predict future accident, analysis has to be done locally at the intersections or road segments that has a higher chance of accident at certain day, hour, weather condition, public event, etc.

1. Identify the risky locations.
2. For these risky locations, use R to identity variables that has an effect.
3. Build a model to predict the probability.


Get help on function:
```R
?function()
args(function)
example(function)
```
## Get Data
See sample data: `data()`

Import from clipboard: `x <- read.table(file = "clipboard", sep="\t", header=TRUE)`

Use `rio` package for 30+ formats: `x <- import('file.json')`

Financial data, try package `quantmod`

Remove data: `rm(x)`

Save all data in workspace: `save.image()`

## Play with new data

See first 6 rows of all columns `head(x)` or first 10 rows `head(x, 10)`

Tail for the last N rows

See structure `str(x)`

Others are: `names(x); colnames(x); rownames(x)`

Basic stats `summary(x)`

Common stats like `mean, median, min, max, sd, var, range`

More easy stats: `library(psych); describe(x)`

Combine function `mypeople <- c("Bob", "Joanne", "Sally", "Tim", "Neal")`

## Subset of data

Vector from data frame `x$COLUMN_NAME`

All rows of column 2, 3, 4 `mtcars[,2:4]`

Only 2 and 4 `mtcars[,c(2,4)]`

Only rows with mpg > 20 `mtcars[mtcars$mpg>20,]`

Column names `mtcars[mtcars$mpg>20,c("mpg","hp")]`

Set default data set name `attach(mtcars)`

Unset with `detach()`

Can also use `subset` function `subset(mtcars, mpg>20, c("mpg", "hp"))`

Find the max MPG row `subset(mtcars, mpg==max(mpg))`

Just show the max MPG value `subset(mtcars, mpg==max(mpg), mpg)`

`filter` on rows and `select` on columns. Combine them (no need to repeat data frame name)
```
mtcars %>% 
filter(mpg > 20) %>%
select(mpg, hp)
```
`arrange` to reorder

`mutate` to add new columns

`summarize` to reduce

## Count
Bin items by column `table(diamonds$cut)`

2D bin `table(diamonds$cut, diamonds$color)`

## Visualization
Simple graph with ggplot2 `qplot(X_COL, Y_COL, data=DATA_FRAME)`

Easy scatterdot `ggplot(DATA_FRAME, aes(x=X_COL, y=Y_COL)) + geom_point()`

See both the points and lines `ggplot(pressure, aes(x=temperature, y=pressure)) + geom_line() + geom_point()`

Bar chart. Function `factor` lists all values of the column. `ggplot(mtcars, aes(factor(cyl))) + geom_bar()`

Histogram `hist(as.numeric(as.character(df$CRASH_HR_NO)), breaks = 48)`

Or `ggplot(mydata, aes(x=columnName)) + geom_histogram(binwidth=n)`

Return median of each row (2 for column) `apply(my_matrix, 1, median)`


