"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
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
var url = "file:///"+system.args[1];
page.open(url, function (status) {
  if (status !== "success") {
    //console.log("Unable to access network");
  } else {
    waitFor(function() {
      return page.evaluate(function() {
          return $("#bor-result").is(":visible") && $("#you-result").is(":visible")  && $("#per-result").is(":visible")  && $("#vol-result").is(":visible");
      });
    }, function() {
      var bor_val = page.evaluate(function() {
        return $("#bor-result").text();
      });
      var per_val = page.evaluate(function() {
        return $("#per-result").text();
      });
      var vol_val = page.evaluate(function() {
        return $("#vol-result").text();
      });
      var you_val = page.evaluate(function() {
        return $("#you-result").text();
      });
      var res = {
        bor: bor_val,
        per: per_val,
        vol: vol_val,
        you: you_val
      }
      var result = JSON.stringify(res)
      console.log(result);

      phantom.exit();
    });
  }
});
