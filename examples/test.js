// http://v8.googlecode.com/svn/branches/bleeding_edge/tools/profviz/profviz.html

for(var i=0; i<10000; i++){
    var b = 1+2;
}

/*
Run V8 with --prof --log-timer-events, or alternatively,
Chrome with --no-sandbox --js-flags="--prof --log-timer-events" to produce v8.log.
Open v8.log on this page. Don't worry, it won't be uploaded anywhere.
Click "Start" to start number crunching. This will take a while.
Click "Show plot/profile" to switch between the statistical profile and the timeline plot.
C++ items are missing in the statistical profile because symbol information is not available.
Consider using the command-line utility instead.
 */
