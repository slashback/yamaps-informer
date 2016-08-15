"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 5000,
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx());
      } else {
        if (!condition) {
          phantom.exit(1);
        } else {
          typeof(onReady) === "string" ? eval(onReady) : onReady();
          clearInterval(interval);
        }
      }
    }, 250);
};


var page = require('webpage').create();
var system = require('system');

var routeJson = encodeURIComponent(system.args[2])

var filepath = "file:///"+system.args[1]+"?route="+routeJson;

page.open(filepath, function (status) {
    // Check for page load success
    if (status !== "success") {
        //console.log("Unable to access network");
    } else {
        // Wait for 'signin-dropdown' to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            return page.evaluate(function() {
                return $("#result").is(":visible");
            });
        }, function() {
           //console.log("The sign-in dialog should be visible now.");
           var res = page.evaluate(function() {
                return $("#result").text();
           });
           
           var result = JSON.stringify({
            time: res,
           })
           console.log(result);
      phantom.exit();
    });
  }
});

