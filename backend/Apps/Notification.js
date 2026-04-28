// const Growl = require('node-notifier/notifiers/growl');
// //new Growl(options).notify();

// //new nn.Growl(options).notify(options);

// var Growl2 = require('node-notifier/notifiers/growl');
// //import * as fs from 'fs';

// var notifier4 = new Growl2({
//     name: 'Growl Name Used', // Defaults as 'Node'
//     host: 'localhost',
//     port: 23053
// });

// notifier4.notify({
//     title: 'Foo',
//     message: 'Hello World',
//   //  icon: fs.readFileSync(__dirname + "/coulson.jpg"),
//     wait: false, // if wait for user interaction

//     // and other growl options like sticky etc.
//     sticky: false,
//     label: void 0,
//     priority: void 0
// });


















// //const notifier = require('node-notifier');



// const Growl = require('node-notifier').Growl;
// // var growly = require('growly');
// // String
// //notifier.notify('Messadfjhbdfkjbldfkjbkldfjkjlj');

// // Object
// // notifier.notify({
// //   title: 'My notification',
// //   message: 'Hello, there!',
// //   sound: true, // Only Notification Center or Windows Toasters
// //     wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
// // });

// var notifier = new Growl({
//     name: 'Growl Name Used', // Defaults as 'Node'
//     host: 'localhost',
//     port: 23053
//   });

// // notifier.notify('Stuffs broken!', { label: 'warning' }, function(err, action) {
// //     console.log('Action:', action);
// // });

// notifier.notify({
//     title: 'Foo',
//     message: 'Hello World',
//    // icon: fs.readFileSync(__dirname + '/coulson.jpg'),
//     wait: false, // Wait for User Action against Notification
  
//     // and other growl options like sticky etc.
//     sticky: true,
//     label: undefined,
//     priority: undefined
//   });


// var Growl2 = require('node-notifier').Growl;
// //import * as fs from 'fs';

// var notifier4 = new Growl2({
//     name: 'Growl Name Used', // Defaults as 'Node'
//     host: 'localhost',
//     port: 23053
// });

// notifier4.notify({
//     title: 'Foo',
//     message: 'Hello World',
//    // icon: fs.readFileSync(__dirname + "/coulson.jpg"),
//     wait: false, // if wait for user interaction

//     // and other growl options like sticky etc.
//     sticky: false,
//     label: void 0,
//     priority: void 0
// });

// var WindowsToaster2 = require('node-notifier').WindowsToaster;

// var notifier3 = new WindowsToaster2({
//     withFallback: false, // Fallback to Growl or Balloons?
//     customPath: void 0 // Relative path if you want to use your fork of toast.exe
// });

// notifier3.notify({
//     title: void 0,
//     message: void 0,
//     icon: void 0, // absolute path to an icon
//     sound: false, // true | false.
//     wait: false, // if wait for notification to end
// }, function(error, responses) {
//     console.log(responses);
// });


// var WindowsBalloon2 = require('node-notifier').WindowsBalloon;

// var notifier5 = new WindowsBalloon2({
//     withFallback: false, // Try Windows 8 and Growl first?
//     customPath: void 0 // Relative path if you want to use your fork of notifu
// });

// notifier5.notify({
//     title: void 0,
//     message: void 0,
//     sound: false, // true | false.
//     time: 5000, // How long to show balloons in ms
//     wait: false, // if wait for notification to end
// }, function(error, responses) {
//     console.log(responses);
// });


// var NotifySend2 = require('node-notifier').NotifySend;

// var notifier6 = new NotifySend2();

// notifier6.notify({
//     title: 'Foo',
//     message: 'Hello World',
//     icon: __dirname + "/coulson.jpg",

//     // .. and other notify-send flags:
//     urgency: void 0,
//     time: void 0,
//     category: void 0,
//     hint: void 0,
// });

// =======================================================================================
// const notifier = require('node-notifier');
// const path = require('path');
 const open = require('open');
// //const NotificationCenter = require('node-notifier').NotificationCenter;
// // var notifier = new NotificationCenter({
// //     withFallback: false, // Use Growl Fallback if <= 10.8
// //     customPath: undefined // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
// //   });
// // String
// //notifier.notify('Message');

// // Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!',
//   icon: path.join(__dirname, 'graylinxlogo2.png'),
//   wait:false,
//   timeout: 20,
//  // open:'https://localhost:3000'
// },
// function(err, action) {
//     console.log('Action:', action);
//     if(action=="activate"){
//         open('https://localhost:3000');
//     }
// });

// // const Growl = require('node-notifier/notifiers/growl');
// // new Growl(options).notify();





// const notifier = require('../node_modules/node-notifier/notifiers/growl');
// const nc =notifier.Growl
// const path = require('path');

//  (
//   {
//     title: 'Phil Coulson',
//     subtitle: 'Agent of S.H.I.E.L.D.',
//     message: "If I come out, will you shoot me? 'Cause then I won't come out.",
//     sound: 'Funk',
//     // case sensitive
//     wait: true,
//     icon: path.join(__dirname, 'bng.jpg'),
//     contentImage: path.join(__dirname, 'bng.jpg'),
//     //open: 'file://' + path.join(__dirname, 'bng.jpg')
//   },
//   function() {
//     console.log(arguments);
//   }
// );

// const fs = require('fs')
// const Growl = require('node-notifier').Growl;
// // Or
// // const Growl = require('node-notifier/notifiers/growl');
 
// let growlNotifier = new Growl({
//   name: 'Node',
//   host: 'localhost',
//   port: 23053
// });
 
// growlNotifier.notify({
//   title: 'Greetings',
//   message: 'Hello user!',
//   icon: fs.readFileSync(__dirname + '/bng.png'),
//   wait: false,
  
//   // Other growl options like sticky etc.
//   sticky: false,
//   label: undefined,
//   priority: undefined
// });
const path=require('path')
const WindowsToaster = require('node-notifier').WindowsToaster;
// Or
// const WindowsToaster = require('node-notifier/notifiers/toaster');
 
let windowsToasterNotifier = new WindowsToaster({
  withFallback: true
});
 
windowsToasterNotifier.notify({
    title: "Windows Toaster Notification",
    message: "This is a notification sent from the Windows Toaster Notifier",
    icon:  path.join(__dirname, 'bng.png'),
    sound: "SMS",
    appID : 'Graylinx',
    timeout:10,
    //install:'https://localhost:3000'
  },
  function (error, action) {
    console.log("------------",action ,error);
    open('https://localhost:3000');
}
);
windowsToasterNotifier.on('click', function (notifierObject, options, event) {
    // Triggers if `wait: true` and user clicks notification

  });


 
