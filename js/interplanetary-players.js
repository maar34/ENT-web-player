
// Screen and GUI dimensions
let sw, sh; // window size
let cellWidth, cellHeight; // gui separation

// Button and slider dimensions
var btW, btH, sliderW, sliderH, initSpeed;

// Data and parameters
let params; // URL parameters
let levelI, worldI_dist, cardColor; // Level index, world distance, card color
let tempID, xDifference, yDifference; // Temporary ID, X/Y differences

let xData, yData, zData, xDataNorm, yDataNorm, zDataNorm; // Data arrays and their normalized versions
let easyX, easyY; // Simplified X, Y values

// GUI and Visual elements
let font1; // font variable
let loadingBar;
let loadP =false; 
let bcol, col; // Background and general colors
let freq, back;
let t1, t2, t3, t4, t5, t6, t7, t8;
let t11, t12, t13, t14, t15, t16, t17, t18;

let cam1; // Camera
let portrait; // Portrait element
let notDOM; // Non-DOM element
let device; // Device information
let canvas; 

let regenIcon, playIcon, pauseIcon, centerIcon; // Icons for control elements
var regenValue; // regen button number state 

let knobs = [];
let steps = 255;  // Number of discrete steps
let sensitivity = 0.9;  // Sensitivity for knob movement
let labels = ["X", "Y", "Z"]; // Labels for the knobs
let knobSpacing; // Spacing between knobs

// Game and deck variables
var game, deck, suit, loadDeck, exoData;

// Input and interaction
let inputX, inputY, inputZ;
let wMinD = 333;
let wMaxD = 1544;
let index, increasing; // Inicializar el índice

// Layout and scaling
let aspectRatio, scale, cols, rows; // Aspect ratio, scale, column/row count
let baseCols = 10, baseRows = 10     ; // Base column and row count
let worldI_speed = 1.0; // World speed index

// Audio channels and analysis
let trackI, filterI; // track 1 -  
let playStateI; // Play state index
var numSamples = 1024;
// Array of amplitude values (-1 to +1) over time.
var samples = [];

let prevTouchX = 0;
let prevTouchY = 0;

var card = {
  id: "",
  wavfile: "",
  mp3file: "",
  initTime: "",
  endTime: "",
  speed: "",
  minSpeed: "",
  maxSpeed: "",
  col1: "",
  col2: "",
  icon_set:"", 
  engine: "",
  xTag: "",
  yTag: "",
  zTag: ""
}
document.oncontextmenu = () => false; // no right click

var easycam,
  state = {
    distance: 388, //final distance
    center: [0, 0, 0],
    rotation: [1., 0., 0., 0.],
  },
  panelX = 30, panelY = 45;

document.oncontextmenu = () => false; // no right click

function preload() {


  initVariables();

  params = getURLParams();

  game = loadJSON("data/" + params.g + ".json");

  font1 = loadFont('fonts/Orbitron-VariableFont_wght.ttf');

  exoData = loadJSON("data/exoplanetData.json");
 
  regenValue = 0.0;


}

document.body.onclick = () => {
  context.resume();
}
// prevent screen movement on touchstart event
document.body.addEventListener('touchstart', function (e) {
  if (e.target == document.body) {
    e.preventDefault();
  }
}, { passive: false });

function setup() {

      // Create Canvas - Always the landscape.  
    canvas = createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    setAttributes('antialias', true);
    
  initVariables();

  xData = 1;
  yData = 0;
  xDataNorm = 1;
  yDataNorm = 0;

  index = 0; 
  increasing = true; 

  playStateI = 0;
  worldI_dist = 940;

  bcol = color(0, 0, 0, 10);
  col = color(255, 0, 0);



    
  
  // load Cards

  if (params.s == 0) {
    card = game.A[params.c];
  };  
  if (params.s == 1) {
    card = game.B[params.c];
  };
  if (params.s == 2) {
    card = game.C[params.c];
  };
  worldI_speed = card.speed;

  xDifference = (card.xTag[2] - card.xTag[1]) > 10;
  yDifference = (card.yTag[2] - card.yTag[1]) > 10;





  easycam = createEasyCam();
  easycam.setState(state, 3000); // animate to state in 3 second
  easycam.setDistanceMin(wMinD);
  easycam.setDistanceMax(wMaxD);
  easycam.state_reset = state;
  easycam.setPanScale(0.0);
  easycam.setPanScale(.02);
  easycam.removeMouseListeners();

  
  cardColor = color(card.col1);

  // Use the selected Font 

  textFont(font1);
  textSize(27);
  createRNBO();
  
  initKnobs(); 
  createDom();

  //    loadingAudio(0);

}  

function draw() {
  
  if (playStateI == 1) background(0, 0, 0);

  noStroke();
  lights();
  const wsize = 1.2
  if (loadP) loadingGUI();

  //Planet and Background color (back from Sliders)
  push();
  // translate (0., 0., -666.);
  normalMaterial();
  easycam.rotateY(playStateI * easyY);
  easycam.rotateX(playStateI * easyX);

  sphere(80, 6, 6);
  rotateX(PI * .4);
  torus(120 * wsize, 7 * wsize, 6, 7);

  translate(- 260, 0., 0.);
  sphere(15, 6, 6);

  translate(520, 0., 0.);
  sphere(15, 6, 6);

  translate(- 260, - 260., 0.);
  sphere(15, 6, 6);

  translate(- 0, 520., 0.);
  sphere(15, 6, 6);
  //translate (0., 0., 666.);

  pop();  
  noFill();
  stroke(cardColor);

  // DRAW  GUI 
  easycam.beginHUD();


//  stroke(cardColor);

  if (playStateI == 0) fill(0, 0, 0, .8);

  const margin = 3.3;
  strokeWeight(1.5);
  beginShape();
  vertex(margin + 0, margin + 0);
  vertex(sw * .86, margin + 0);
  vertex(sw - margin, sh * .14);
  vertex(sw - margin, sh - margin);
  vertex(sw * .14, sh - margin);
  vertex(margin + 0,  sh - margin );
  vertex(margin + 0, margin + 0);
  endShape();

  if (playStateI == 0) fill(0, 1);


      // DRAW 3D GUI 
  if (!loadP) {

    // Draw each knob as a sphere and its value
    knobs.forEach((knob, index) => {
      let angleY = map(knob.valueY, 0, steps - 1, 0, 360, true);

      push();
      translate(knob.x, knob.y);
      rotateZ(radians(angleY));  
      fill (0, 50);
      sphere(knob.size * .5, 7, 7); // Draw a sphere for the knob
      rotateZ(radians(90));
      line(knob.size * .5, 0,  0, 0);
      pop();
      
    });
  }else{


    fill(0, 0, 0, 33); // RGBA: Black with 50% transparency (127 is half of 255)
    noStroke();
    rect(0, 0, sw, sh); // Cover the entire canvas
  

  }

  easycam.endHUD();

  // REGENERATIVE UPDATES 

  regenUpdates();

}





function regenUpdates(){
  

  switch (regenValue) {
    case 0:
    break;
    case 1:
      trans(2);
    break;
    case 2:
      trans(4);
    break;
    case 3:
      trans(8);
    break;
    case 4:
      trans(16);
    break;
    case 5:
    orb(3)
    break;
    case 6:
      orb(9)
    break;
    case 7:
      orb(27)
    break;

}


}

function trans(amp){

  // read, interpolate and generate exoplanets transit data for sonification / vizualization 

//  let amp = 1+regenValue*.5; // choose a normalized amp inside 8 regenButton variations 
  
  
  if (increasing) {
    index += amp * 0.0001; // Aumentar el índice
    if (index >= 0.99) {
        index = 0.99;
        increasing = false; // Cambiar la dirección
    }
} else {
    index -= amp * 0.0001; // Disminuir el índice
    if (index <= 0.00999) {
        index = 0.00999;
        increasing = true; // Cambiar la dirección
    }
}

  let result = interpolateTransitData(exoData, index); 

 // speedAmount = result.normalizedBJD;


  xData = index*255;
  xInput();
  yData = result.normalizedB*255.;
  yInput();
  zData = result.normalizedDuration*255;
  zInput();

  setKnobValue(knobs[0], 50, xData, 50); // Set the first knob's values
  setKnobValue(knobs[1], 50, yData, 50); // Set the first knob's values
  setKnobValue(knobs[2], 50, zData, 50); // Set the first knob's values
 
  t15.html(result.transitDate);
  t16.html(nfs(result.b, 1, 2));
  t17.html(nfs(result.duration, 1, 2));

}

function orb(amp){

  // read, interpolate and generate exoplanets orbit data for sonification / vizualization 

    index += amp * 0.0001; // Aumentar el índice
    
    index = index%1;  

    const orbitData = generateOrbitData(exoData, index);



    xData = orbitData.d.orbitPosition*255.;
    xInput();
    yData = orbitData.c.orbitPosition*255.;
    yInput();
    zData = orbitData.b.orbitPosition*255;
    zInput();
  
    setKnobValue(knobs[0], 50, xData, 50); // Set the first knob's values
    setKnobValue(knobs[1], 50, yData, 50); // Set the first knob's values
    setKnobValue(knobs[2], 50, zData, 50); // Set the first knob's values


  t15.html(nfs(orbitData.d.dayInOrbit, 1, 2));
  t16.html(nfs(orbitData.b.dayInOrbit, 1, 2));
  t17.html(nfs(orbitData.c.dayInOrbit, 1, 2));
  
  
}



function regenLogic() {

  regenValue = (regenValue + 1) % 8; // This will cycle regenValue from 0 to 7
 // result = normalizeAndInterpolate(exoData, (regenValue/10)); // 
 // console.log(result);

  switch (regenValue) {
      case 0:
          regenButton.html('&#9842;');
          t11.html("");
          t12.html("");
          t13.html("");
          t15.html("");
          t16.html("");
          t17.html("");
          t21.html("Astronaut Control");
          t22.html("0");


          break;
      case 1:

          regenButton.html('&#9843;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX1']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY1']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ1']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['General']);
          t22.html("1");

          break;
      case 2:
          regenButton.html('&#9844;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX1']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY1']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ1']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['General']);
          t22.html("2");

          break;
      case 3:
          regenButton.html('&#9845;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX1']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY1']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ1']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['General']);
          t22.html("3");

          break;
      case 4:

          regenButton.html('&#9846;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX1']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY1']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ1']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['General']);
          t22.html("4");


          break;
      case 5:
          regenButton.html('&#9847;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX2']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY2']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ2']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_description']);
          t22.html("5");

          break;
      case 6:
          regenButton.html('&#9848;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX2']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY2']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ2']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_description']);
          t22.html("6");

          break;
      case 7:
          regenButton.html('&#9849;');
          t11.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pX2']+ ":");
          t12.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pY2']+ ":");
          t13.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['pZ2']+ ":");
          t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_description']);
          t22.html("7");

          break;
  }
}


function playPause() {
  notDOM = false;

  // Check if the AudioContext is already running
  if (context.state === 'suspended') {
    // If suspended (not yet running), resume it
    context.resume().then(() => {
      console.log('Playback resumed successfully');
    });
  }

  // Toggle play state
  if (playStateI == 0) {
    playButton.attribute('src', pauseIcon);

    // Schedule play events
    let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "play", [1]);
    device.scheduleEvent(messageEvent);
    
    playStateI = 1;
  } else {
    playButton.attribute('src', playIcon);

    // Schedule stop events
    let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "play", [0]);
    device.scheduleEvent(messageEvent);

    playStateI = 0;
  }
}

function xB() {


  switch (regenValue) {
    case 0:
      notDOM = false;
      setKnobValueY(knobs[0], 127);      
      t21.html("X Balance");
      break;
    case 1:
    case 2:
    case 3:
    case 4:

      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['Transit_Date']);

      break;
    case 2:
      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['Transit_Date']);

      break;
    case 3:
      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['Transit_Date']);

      break;
    case 4:
      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['Transit_Date']);

      break;
    case 5:
    case 6:
    case 7: 
    
    t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_period_days']);

      break;


  }



}

function yB() {


  switch (regenValue) {
    case 0:
      notDOM = false;
      setKnobValueY(knobs[1], 127); 
      t21.html("Y Balance");
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['b']);

      break;

    case 5:
    case 6:
    case 7: 
    t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_period_days']);

      break;

  }

}

function zB() {


  switch (regenValue) {
    case 0:
      notDOM = false;
      setKnobValueY(knobs[2], 127);  
      t21.html("Z Balance");
    
      break;
    case 1:
    case 2:
    case 3:
    case 4:

      t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['Duration_hrs']);

      break;
    case 5:
    case 6:
    case 7:


    t21.html(exoData['Kepler-47']['Maar_World']['parameter_descriptions']['orbital_period_days']);

      break;
  }


}

function loaded() {

  loadP = false;



  playButton.show();
  regenButton.show();
  xButton.show();
  yButton.show();
  zButton.show();

  guiData();

  //trackI.disconnect();
  //trackI.connect(filterI);

}

function errorLoadingAudio(_error) {

  let p = createP(_error);
  p.style('font-size', '16px');
  p.position(10, 0);

}

function loadingAudio(_loadingN) {

  loadingBar = _loadingN;
  loadP = true;

}



function createDom() {

  let domColor = color (card.col1);
  let domAlpha = color (card.col1); 
  domAlpha.setAlpha(190);

  



  centerIcon = 'icons/' + nf(card.icon_set, 2) + '_center.svg';

  xButton = createImg(centerIcon, 'Play Button', '&#11042');
  xButton.style('width', btW + 'px');
  xButton.style('height', btH + 'px');
  xButton.style('background-color', domColor);
  xButton.style('color', domAlpha);
  xButton.style('border', 'none');
  xButton.style('background', 'none');
  xButton.style('-webkit-touch-callout', 'none'); // Disable long-press callout on iOS
  xButton.mousePressed(xB);
  xButton.touchStarted(xB);
  xButton.mouseReleased(releaseDOM);
  xButton.touchEnded(releaseDOM);
  //xButton.addClass("crosshair");

  yButton = createImg(centerIcon, 'Play Button', '&#11042');
  yButton.style('width', btW + 'px');
  yButton.style('height', btH + 'px');
  yButton.style('background-color', domColor);
  yButton.style('color', domAlpha);
  yButton.style('border', 'none');
  yButton.style('background', 'none');
  yButton.style('-webkit-touch-callout', 'none'); // Disable long-press callout on iOS
  yButton.mousePressed(yB);
  yButton.touchStarted(yB);
  yButton.mouseReleased(releaseDOM);
  yButton.touchEnded(releaseDOM);
  //yButton.addClass("crosshair");

  zButton = createImg(centerIcon, 'Play Button', '&#11042');
  zButton.style('width', btW + 'px');
  zButton.style('height', btH + 'px');
  zButton.style('background-color', domColor);
  zButton.style('color', domAlpha);
  zButton.style('border', 'none');
  zButton.style('background', 'none');
  zButton.style('-webkit-touch-callout', 'none'); // Disable long-press callout on iOS
  zButton.mousePressed(zB);
  zButton.touchStarted(zB);
  zButton.mouseReleased(releaseDOM);
  zButton.touchEnded(releaseDOM);
  //zButton.addClass("crosshair");

  playIcon = 'icons/' + nf(card.icon_set, 2) + '_play.svg';

  // create buttons and sliderss
  playButton = createImg(playIcon, 'Play Button', '&#9655');
  pauseIcon = 'icons/' + nf(card.icon_set, 2) + '_pause.svg';

  playButton.style('width',  btW+ 'px');
  playButton.style('height', btH + 'px' );
  playButton.style('background-color', domColor);
  playButton.style('color', domAlpha);
  playButton.style('border', 'none');
  playButton.style('background', 'none');
  playButton.style('-webkit-touch-callout', 'none'); // Disable long-press callout on iOS
  playButton.mousePressed(playPause);
  playButton.touchStarted(playPause);
  playButton.mouseReleased(releaseDOM);
  playButton.touchEnded(releaseDOM);

  // create buttons and sliderss

  regenIcon = 'icons/' + nf(card.icon_set, 2) + '_regen.svg';

  regenButton = createImg(regenIcon, 'Regen Button', '&#9842');

  regenButton.style('width', btW+'px');
  regenButton.style('height',btH+'px');
  regenButton.style('border', 'none');
  regenButton.style('background', 'none');
  regenButton.style('-webkit-touch-callout', 'none'); // Disable long-press callout on iOS
  regenButton.mousePressed(regenLogic);
  regenButton.touchStarted(regenLogic);
  regenButton.mouseReleased(releaseDOM);
  regenButton.touchEnded(releaseDOM);

  updateButtonPositions();
  


  // create sliders

  initSpeed = map(float((card.speed)), float(card.minSpeed), float(card.maxSpeed), 0., 255.);
  //xSlider = createSlider(0., 255, 128);


  //   myElement.style('background', domColor); // this change only the line color*/
  // xSlider.style('::-webkit-slider-thumb:background', 'red');
  // xSlider.style('background', 'rgba(0, 0, 0, 0)');
  // myClass.style(`::-webkit-slider-thumb { background: ${domColor}; }`);


  //ySlider = createSlider(0, 255, 128);

  playButton.hide();
  regenButton.hide();

  xButton.hide();
  yButton.hide();
  zButton.hide();


}

function updateButtonPositions() {
  if (!canvas || !canvas.elt) {
      console.error('Canvas is not defined');
      return;
  }

  
  let canvasRect = canvas.elt.getBoundingClientRect();

  let offsetY = canvasRect.height / 2 + cellHeight; // Adjust the Y offset

  knobs.forEach((knob, index) => {
    let screenX = canvasRect.left + (canvasRect.width / 2) + knob.x - cellWidth*.5;
    let screenY = canvasRect.top + offsetY + knob.y;

    if (index === 0 && xButton) {
      xButton.position(screenX, screenY);
    } else if (index === 1 && yButton) {
      yButton.position(screenX, screenY);
    } else if (index === 2 && zButton) {
      zButton.position(screenX, screenY);
    }
  });

  playButton.position( cellWidth , sh-cellHeight*2);
  regenButton.position( sw-(cellWidth+cellHeight) , sh-cellHeight*2);  

 
  }


function updateDom() {

  sw = window.innerWidth;
  sh = window.innerHeight;

  aspectRatio = sw / sh;
  scale = sqrt(aspectRatio); // Scale factor based on square root of aspect ratio
  cellSize = min(width, height) / baseCols;
  cols = floor(width / cellSize); // Adjust columns based on aspect ratio
  rows = floor(height / cellSize); // Adjust rows based on aspect ratio


  cellWidth = sw / cols;
  cellHeight = sh / rows;
  btW = cellHeight;
  btH = cellHeight;

  knobSpacing = (cellWidth+cellHeight)*1.4; 

  // move and resize buttons
  playButton.style('width',  btW+ 'px');
  playButton.style('height',  btH + 'px');
  
  regenButton.style('width',  btW+ 'px');
  regenButton.style('height',  btH + 'px' );

  xButton.style('width', btW + 'px');
  xButton.style('height', btH + 'px');

  yButton.style('width', btW + 'px');
  yButton.style('height', btH + 'px');

  zButton.style('width', btW + 'px');
  zButton.style('height', btH + 'px');

  updateButtonPositions();

  guiDataStyle (cellWidth, cellHeight); 




}

function xInput() {

  inputX.value = xData;

  let xDataM = map(xData, 0, steps - 1, float(card.xTag[1]), float(card.xTag[2]));
  t6.html(nfs(xDataM, 1, 2));
  
  easyY = xDataM * -0.0077;

}

function yInput() {

  inputY.value = yData;

  let yDataM = map(yData, 0, steps - 1, float(card.yTag[1]), float(card.yTag[2]));
  t7.html(nfs(yDataM, 1, 2));

  easyX = yDataM * -0.00077;

  // if the range in x axe is greter than 10 (xDifference) then animate planet with normalized value, else use the normal value - this exception works nice with speed and non simetrical parameters

}

function zInput() {


  if (zData <= (steps - 1)/2) {
    worldI_dist = map(zData, 0., (steps - 1)/2, wMaxD, wMinD, true);
  } else {
    worldI_dist = map(zData, (steps - 1)/2, (steps - 1), wMinD, wMaxD, true);
  }
  easycam.setDistance(worldI_dist, 1.);

  inputZ.value = zData;

  t5.html(nfs(worldI_dist, 1, 2));

  zDataV = map(zData, 0., 255., float(card.zTag[1]), float(card.zTag[2]));
  t8.html(nfs(zDataV, 1, 2));

}

/*
function xOutput() {
  if (!loadP) {
    var startX = easycam.mouse.curr[0];
    knobs[0].valueX = map(startX, 0, sw, 0, steps - 1);
    xInput(); // Update xData based on knob value
  }
}

function yOutput() {
  if (!loadP) {
    var startY = easycam.mouse.curr[1];
    knobs[1].valueY = map(startY, 0, sh, steps - 1, 0);
    yInput(); // Update yData based on knob value
  }
}

function zOutput(delta) {
  if (!loadP) {
    knobs[2].valueZ = constrain(knobs[2].valueZ + delta, 0, steps - 1);
    zInput(); // Update worldI_dist and zData based on knob value
  }
}
*/



function guiData() {
  // Render the labels
  t1 = createP('Distance:');
  t2 = createP(card.xTag[0] + ":");
  t3 = createP(card.yTag[0] + ":");
  t4 = createP(card.zTag[0] + ":");
  t5 = createP();
  t5.html(worldI_dist);
  t6 = createP();
  t6.html(nfs("0", 1, 2));
  t7 = createP("0");
  t8 = createP("0");
  t11 = createP("");
  t12 = createP("");
  t13 = createP("");
  t15 = createP();
  t15.html("");
  t16 = createP();
  t16.html("");
  t17 = createP("");
  t21 = createP('');
  t22 = createP('0');

 // t21.position(cellWidth * offset, 20);
  guiDataStyle (cellWidth, cellHeight); 
}

function guiDataStyle(cellWidth, cellHeight) {
  
  let offset = 1;
  let textColor = card.col1;
  let black = color(0);
  
  // Calculate guiTextSize based on a combination of windowWidth and windowHeight
  let guiTextSize = min(windowWidth, windowHeight) * 0.02; 

  // Set positions and styles for column 1 elements (t1, t2, t3, t4)
  let col1Elements = [t1, t2, t3, t4, t11, t12, t13];
  col1Elements.forEach((elem, index) => {
    let x = cellWidth * offset;
    let y = index * cellHeight * .5 + guiTextSize;
    elem.position(x, y);
    elem.style('color', textColor);
    elem.style('font-size', guiTextSize + 'px');
  });

  // Set positions and styles for column 2 elements (t5, t6, t7, t8)
  let col2Elements = [t5, t6, t7, t8, t15, t16, t17];
  col2Elements.forEach((elem, index) => {
    let x = 3 * cellWidth * offset; // Position for the second column
    let y = index * cellHeight * .5 + guiTextSize;
    elem.position(x, y);
    elem.style('color', textColor);
    elem.style('font-size', guiTextSize + 'px');
  });


  t21.style('background-color', black);
  t21.style('color', textColor);

  t21.style('width', 6*btW + 'px');
  t21.attribute('align', 'center');
  t21.position( sw *.5 - 3*btW , sh * .2);
  t21.style('font-size', guiTextSize + 'px');

  t22.style('background-color', black);
  t22.style('color', textColor);

  t22.style('width', btW + 'px');
  t22.attribute('align', 'center');
  t22.position( sw-(cellWidth+cellHeight) , sh-cellHeight);  
  t22.style('font-size', guiTextSize + 'px');

}


function loadingGUI() {
  ///// LOADING TEXTS 
  textAlign(CENTER);
  let tempF = frameRate() % 30.;
  if (tempF > 15.) {
    fill(0, 0, 255);
  } else {
    fill(255, 0, 0);
  }
  if (loadingBar == 1) {
    translate(0., 0., -666.);

    text("Receiving Sound Waves", 0, -sh * .34 - cellHeight * 4);
    text("please wait, unmute device...", 0, -sh * .34 - cellHeight * 1);
    translate(0., 0., 666.);

  } else {
    text("", 0, -cellHeight * 13);
  }
}

function windowResized() {

  initVariables();
  //initKnobs();
  resizeCanvas(sw, sh);
  updateDom();
  updateButtonPositions();
  easycam.setViewport([0, 0, sw, sh]);

}



function pressDOM() {
  notDOM = false;

}
function releaseDOM() {

//  easycam.attachMouseListeners();
  notDOM = true;
  t21.html("");
 // attachMouseListeners();

}


function mousePressed() {
  knobs.forEach(knob => {
      knob.isDragging = dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2;
  });
  return false; // Prevent default behavior and stop propagation
}


function mouseDragged() {

  knobs.forEach((knob, index) => {
    if (dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2) {
      knob.isDragging = true;
      updateKnobValue(knob, mouseX, mouseY);
      pressDOM();
    }
  });

}

// Mouse Wheel Function
function mouseWheel(event) {
  pressDOM();

  knobs.forEach(knob => {
    if (dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2) {
      let deltaZ = event.delta * sensitivity;
      knob.valueZ = constrain(knob.valueZ - deltaZ, 0, steps - 1);
      worldI_dist = map(knob.valueZ, 0, steps - 1, wMinD, wMaxD); // Update worldI_dist for Z knob
    }
  });
}

function mouseReleased() {
  knobs.forEach(knob => knob.isDragging = false);
}

function touchStarted() {
  prevTouchX = touches[0].x;
  prevTouchY = touches[0].y;

  knobs.forEach(knob => {
      knob.isDragging = dist(touches[0].x, touches[0].y, knob.x, knob.y) < knob.size / 2;
  });
  return false; // Prevent default behavior and stop propagation
}

function touchMoved() {
  // Update knobs based on touch movement
  knobs.forEach(knob => {
    if (knob.isDragging) {
      updateKnobValue(knob, touches[0].x, touches[0].y);
    }
  });
  prevTouchX = touches[0].x;
  prevTouchY = touches[0].y;
  return false; // Prevent default behavior
}

function touchEnded() {
  knobs.forEach(knob => knob.isDragging = false);
  return false; // Prevent default behavior and stop propagation

}


function doubleClicked() {
  xB();
  yB();
  zB();
  t21.html("");

}

function initVariables() {

  sw = window.innerWidth;
  sh = window.innerHeight;

  aspectRatio = sw / sh;
  scale = sqrt(aspectRatio); // Scale factor based on square root of aspect ratio
  cellSize = min(width, height) / baseCols;
  cols = floor(width / cellSize); // Adjust columns based on aspect ratio
  rows = floor(height / cellSize); // Adjust rows based on aspect ratio

  xData = 1.;
  yData = 1.;
  zData = 1.; 


  cellWidth = sw / cols;
  cellHeight = sh / rows;

  knobSpacing = (cellWidth+cellHeight)*1.4;


  btW = cellHeight;
  btH = cellHeight;
//  sliderW = sw * .6;
//  sliderH = sliderW * .11;
  startX = 0;
  startY = 0;
  notDOM = true;

}

function initKnobs(){

  let startX = window.innerWidth*.5-knobSpacing;
  let startY = window.innerHeight*.75;

  // Initialize three knobs
  for (let i = 0; i < labels.length; i++) {
    knobs.push({
      x: startX + i * knobSpacing,
      y: startY,
      z: 0,  // Initial Z position
      size: (cellWidth+cellHeight)*.8,
      valueX: 127,
      valueY: 127,
      valueZ: 127  // Initial Z value
    });


}
}

async function createRNBO() {

  try {

    const patchExportURL = "export/" + card.engine;

    // Create AudioContext
    let WAContext = window.AudioContext || window.webkitAudioContext;
    context = new WAContext();

    let rawPatcher = await fetch(patchExportURL);
    let patcher = await rawPatcher.json();
    device = await RNBO.createDevice({ context, patcher }); // seems we need to access the default exports via .default

    device.node.connect(context.destination);
    loadAudioBuffer(context);

    // Connect With Parameters

    
    inputX = device.parametersById.get("inputX");
    inputY = device.parametersById.get("inputY");
    inputZ = device.parametersById.get("inputZ");
    //    print ("I am A2")
  } catch (error) {
    console.log(error);
    errorLoadingAudio(error);
  }

}

function interpolateTransitData(transitData, index) {
  const transits = transitData['Kepler-47']['Maar_World']['transits'];
  const numTransits = transits.length;

  // Calculate the positions in the array based on the index
  const pos = index * (numTransits - 1);
  const lowerIndex = Math.floor(pos);
  const upperIndex = Math.ceil(pos);
  const t = pos - lowerIndex; // Fractional part for interpolation

  // Handling edge cases
  if (lowerIndex === upperIndex || upperIndex >= numTransits) {
      return {
          ...transits[lowerIndex],
          exactTransitDate: julianToDate(transits[lowerIndex].BJD)
      };
  }

  const lowerTransit = transits[lowerIndex];
  const upperTransit = transits[upperIndex];

  // Linear interpolation function
  const interpolate = (start, end, t) => (1 - t) * start + t * end;

  // Interpolating BJD and converting to exact date
  const interpolatedBJD = interpolate(lowerTransit.BJD, upperTransit.BJD, t) + 2455000;
  const exactTransitDate = julianToDate(interpolatedBJD);

  // Interpolated values
  return {
      normalizedB: interpolate(lowerTransit.Normalized_b, upperTransit.Normalized_b, t),
      normalizedDuration: interpolate(lowerTransit.Normalized_Duration_hrs, upperTransit.Normalized_Duration_hrs, t),
      b: interpolate(lowerTransit.b, upperTransit.b, t),
      duration: interpolate(lowerTransit.Duration_hrs, upperTransit.Duration_hrs, t),
      transitDate: exactTransitDate,
      normalizedBJD: interpolate(lowerTransit.Normalized_BJD, upperTransit.Normalized_BJD, t)
  };
}


function julianToDate(julian) {
  // Adding 2,455,000 back to the provided BJD
  const jd = julian + 0.5;

  const Z = Math.floor(jd);
  const F = jd - Z;
  let A = Z;
  if (Z >= 2299161) {
      const alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A += 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = (E < 14) ? E - 1 : E - 13;
  const year = (month > 2) ? C - 4716 : C - 4715;

  return `${Math.floor(day)}-${month}-${year}`;
  
}

function generateOrbitData(json, index) {
  // Calculate the sine wave position and day in orbit for a planet
  function getOrbitData(orbitalPeriod, index) {
    // Normalize the index by the orbital period
    const normalizedIndex = index * orbitalPeriod;
    const phase = (normalizedIndex % orbitalPeriod) / orbitalPeriod * 2 * Math.PI;
    const orbitPosition = (Math.sin(phase) + 1) / 2;
    const dayInOrbit = normalizedIndex % orbitalPeriod;
    return { dayInOrbit, orbitPosition };
  }

  // Get the orbital periods
  const periodB = json["Kepler-47"]["Planets"]["Kepler-47 b"]["orbital_period_days"];
  const periodC = json["Kepler-47"]["Planets"]["Kepler-47 c"]["orbital_period_days"];
  const periodD = json["Kepler-47"]["Planets"]["Kepler-47 d"]["orbital_period_days"];

  return {
    "b": getOrbitData(periodB, index),
    "c": getOrbitData(periodC, index * periodC / periodB), // scale index for planet C
    "d": getOrbitData(periodD, index * periodD / periodB)  // scale index for planet D
  };
}


function updateKnobValue(knob, currentX, currentY) {

  let deltaX, deltaY;


  if (touches.length > 0) { // If it's a touch event
    deltaX = currentX - prevTouchX;
    deltaY = currentY - prevTouchY;
  } else { // If it's a mouse event
    deltaX = currentX - pmouseX;
    deltaY = currentY - pmouseY;
  }

  knob.valueX -= deltaX * sensitivity;
  knob.valueY -= deltaY * sensitivity;

  // Constrain the values within the valid range
  knob.valueX = constrain(knob.valueX, 0, steps - 1);
  knob.valueY = constrain(knob.valueY, 0, steps - 1);

  // Update xData, yData, zData based on knob values
  if (knob === knobs[0]) { // If it's the X knob
    xData = knob.valueY;
    xInput();
  } else if (knob === knobs[1]) { // If it's the Y knob
    yData = knob.valueY;
    yInput();
  } else if (knob === knobs[2]) { // If it's the Z knob
    zData = knob.valueY;
    zInput();
  }
}


function setKnobValueY(knob, newValueY) {
  // Update the knob's Y value
  knob.valueY = newValueY;

  // Constrain the value within the valid range
  knob.valueY = constrain(knob.valueY, 0, steps - 1);

  // If the knob's valueY is tied to certain parameters or UI elements, update them
  if (knob === knobs[0]) { // If it's the X knob (assuming it uses valueY for some reason)
    xData = knob.valueY;
    xInput(); // Update any related UI or data
  } else if (knob === knobs[1]) { // If it's the Y knob
    yData = knob.valueY;
    yInput(); // Update any related UI or data
  } else if (knob === knobs[2]) { // If it's the Z knob (assuming it uses valueY for some reason)
    zData = knob.valueY;
    zInput(); // Update any related UI or data
  }
}


function setKnobValue(knob, newXValue, newYValue, newZValue) {
  // Update the knob values
  knob.valueX = newXValue;
  knob.valueY = newYValue;
  knob.valueZ = newZValue;

  // Constrain the values within the valid range
  knob.valueX = constrain(knob.valueX, 0, steps - 1);
  knob.valueY = constrain(knob.valueY, 0, steps - 1);
  knob.valueZ = constrain(knob.valueZ, 0, steps - 1);

  // You can call the input functions to update any related data or UI elements
  // For example, if the knob values are tied to certain parameters or UI elements:
  if (knob === knobs[0]) { // If it's the X knob
    xData = knob.valueY;
    xInput(); // Update any related UI or data
  } else if (knob === knobs[1]) { // If it's the Y knob
    yData = knob.valueY;
    yInput(); // Update any related UI or data
  } else if (knob === knobs[2]) { // If it's the Z knob
    zData = knob.valueY;
    zInput(); // Update any related UI or data
  }
}


async function loadAudioBuffer(_context) {

  loadingAudio(1);
  context = _context;

  let audioBuf
  try {
    let audioURL;

    if (navigator.connection) {
      const speed = navigator.connection.downlink;
      audioURL = speed > 1 ? card.mp3file : card.wavfile;

    } else {
      audioURL = card.mp3file;
    }
    
    try {
      const fileResponse = await fetch(audioURL, {
        cache: 'reload'
      });
      
      if (!fileResponse.ok) {
        throw new Error("Network response was not OK");
        errorLoadingAudio("Network response was not OK");

      }
      // Load our sample as an ArrayBuffer;
      const arrayBuf = await fileResponse.arrayBuffer();
      //  console.log(arrayBuf);

      // Decode the received Data as an AudioBuffer
      audioBuf = await context.decodeAudioData(arrayBuf);
      // Set the DataBuffer on the device
      await device.setDataBuffer("world1", audioBuf);

    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
      errorLoadingAudio(error);

    }

    loaded();

  } catch (error) {
    console.log(error);
    errorLoadingAudio(error);
  }


}

