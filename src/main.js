const Bean = require('ble-bean');
const $ = require('jquery');


console.log('Bean', Bean);

const element = document.querySelector("#greeting");
element.innerText = "Hello, world!";

const button = $('#scan');
const sliderR = $('#sliderR');
const sliderG = $('#sliderG');
const sliderB = $('#sliderB');

function sliderChanges(){
  const r = parseInt(sliderR[0].value, 10);
  const g = parseInt(sliderG[0].value, 10);
  const b = parseInt(sliderB[0].value, 10);
  console.log(r,g,b);
  if(connectedBean){
    connectedBean.setColor(new Buffer([r,g,b]),
        function(){
          console.log("led color sent");
      });
  }
}

sliderR.change(sliderChanges);
sliderG.change(sliderChanges);
sliderB.change(sliderChanges);

var connectedBean;

function doScan(){
 console.log('hello');
  var intervalId;
  
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

  bean.connectAndSetup(function(ready){
    
    console.log('bean ready', ready);
    
    bean.requestAccell(function(ok){
      console.log("request accell sent", ok);
    });
    
    const r = parseInt(sliderR[0].value, 10);
    const g = parseInt(sliderG[0].value, 10);
    const b = parseInt(sliderB[0].value, 10);
  
    
    bean.setColor(new Buffer([r,g,b]),
      function(){
        console.log("led color sent");
    });

    var readData = function() {


      

      // bean.requestTemp(
      // function(){
      //   console.log("request temp sent");
      // });

    };

    intervalId = setInterval(readData,2000);

  });

});



 
}

//function doCharacteristic

button.click(doScan);