/**
 * A Node.js wrapper for terminal-notify.
 *
 * Requirements:
 *  - Mac OS X 10.8
 */

var child_process = require('child_process')
  , spawn = child_process.spawn
  , exec = child_process.exec
  , os = require('os')
  , notifier = 'vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier'
  , osVersionError = 'Incorrect OS. Requires Mac OS X 10.8 or higher';


var isMacOSX = function (cb) {
  if (process.platform != 'darwin') {
    return cb(true, osVersionError);
  }

  return exec("sw_vers -productVersion", function (error, stdout, stderr) {
    if (error) {
      return cb(true, error, stderr);
    }
    if (stdout >= "10.8") {
      return cb(false);
    }

    return cb(true, osVersionError);
  });
}

var Notifier = function () {
  if (!(this instanceof Notifier)) {
    return new Notifier();
  }
  this.isOSX = false;
}
, constructArgumentList = function (options) {
  var args = [];

  for(var key in options) {
    var val = options[key];
    args.push('-' + key, val);
  };

  return args;
}

, command = function (options, cb) {
  var notifyApp = spawn(notifier, options);

  notifyApp.stdout.on('data', function (data) {
    cb(null, data.toString());
  });

  notifyApp.stderr.on('data', function (data) {
    cb(data.toString());
  });

  notifyApp.on('exit', function (code, message) {
    if (!code) {
      return cb(message);
    }
    cb(null, message);
  });

  return notifyApp;
};

Notifier.prototype.notify = function (options, callback) {
    var argsList = constructArgumentList(options);

    if(this.isOSX) {
      command(argsList, callback);
      return this;
    }

    var self = this;
    isMacOSX(function (error, errorMsg) {
      if (error) {
        throw new Error(errorMsg);
      }
      command(argsList, callback);
      self.isOSX = true;
    });
    return this;
};


module.exports = new Notifier();