const Bean = require('ble-bean');


console.log('Bean', Bean);

const element = document.querySelector("#greeting");
element.innerText = "Hello, world!";

const button = document.getElementById('scan');

const SERIAL_SERVICE = 'a495ff10-c5b1-4b44-b512-1370f02d74de';


function doScan(){
 console.log('hello');
  var intervalId;
  var connectedBean;
  
  Bean.discover(function(bean){
  connectedBean = bean;
  
  bean.on("accell", function(x, y, z, valid){
    var status = valid ? "valid" : "invalid";
    console.log("received " + status + " accell\tx:\t" + x + "\ty:\t" + y + "\tz:\t" + z );
  });

  bean.on("temp", function(temp, valid){
    var status = valid ? "valid" : "invalid";
    console.log("received " + status + " temp:\t" + temp);
  });

  bean.on("disconnect", function(){
    console.log('disconnected');
  });

  bean.connectAndSetup(function(){

    var readData = function() {

      //set random led colors between 0-255. I find red overpowering so red between 0-64
      bean.setColor(new Buffer([0,0,255]),
        function(){
          console.log("led color sent");
      });

      // bean.requestAccell(
      // function(){
      //   console.log("request accell sent");
      // });

      // bean.requestTemp(
      // function(){
      //   console.log("request temp sent");
      // });

    };

    intervalId = setInterval(readData,1000);

  });

});



 
}

//function doCharacteristic

button.addEventListener("click", doScan, false);