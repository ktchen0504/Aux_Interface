const canvas = document.querySelector('canvas');

//create a canvas object c
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*90/100; 

const socketio = io.connect();

//*******************************************************************//

//mouse coordinate objects as variable
let mouse = {
  x : undefined,
  y : undefined
}

const icon = [
  {id:1, dir:'/src/Exp_moveobj.png'},
  {id:2, dir:'/src/Exp_sysissue.png'},
  {id:3, dir:'/src/Exp_approachcar.png'},
  {id:4, dir:'/src/Exp_fog.png'},
  {id:5, dir:'/src/Exp_radar_1.png'},
  {id:6, dir:'/src/Exp_radar_1.png'},
  {id:7, dir:'/src/Exp_radar_1.png'},
  {id:8, dir:'/src/Exp_radar_1.png'}, 
  {id:9, dir:'/src/Act_set1.png'}
]

const icon_set = [
  {num:1, items:[icon[0].dir, icon[1].dir, icon[2].dir, icon[3].dir]},
  {num:2, items:[icon[1].dir, icon[2].dir, icon[3].dir, icon[0].dir]},
  {num:3, items:[icon[3].dir, icon[0].dir, icon[1].dir, icon[2].dir]}
]

const radar_set = [
  {num:1, items:[icon[4].dir, icon[5].dir, icon[6].dir, icon[7].dir]}
]

const act_icon_set = [
  {num:1, items:[icon[8].dir, icon[8].dir, icon[8].dir, icon[8].dir]}
]

function backgroundPanel(ctx, x, y, width, height, colorset) {
  var cor = colorset;
  ctx.beginPath();
  ctx.moveTo(x, y );
  ctx.lineTo(x + width, y );
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y);
  switch(cor) {
    case 1:
      cor_set = 'rgba(51, 51, 51, 1)';
      break;
    case 2:
      cor_set = 'rgba(51, 51, 51, 1)';
      break;
  }
  ctx.fillStyle = cor_set;
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
  ctx.lineWidth = 6;

  ctx.fill();  
  ctx.stroke();
}

function upRect(ctx, x, y, width, height, radius, colorset){
  var cor = colorset;
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width -radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + height, radius);
  switch(cor) {
    case 1:
      cor_set = 'rgba(26, 146, 196, 1)';
      break;
    case 2:
      cor_set = 'rgba(19, 108, 143, 1)';
      break;
    case 3:
      cor_set = 'rgba(14, 78, 104, 1)';
      break;
  }
  ctx.fillStyle = cor_set;
  ctx.fill();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.lineTo(x, y + radius);
  ctx.fillStyle = 'rgba(127, 127, 127, 1)';
  ctx.fill();
}

function drawbackgroundCircle(ctx, x, y, radius){
  var radigrad = ctx.createRadialGradient(x, y, 15, x, y, radius+20);
  radigrad.addColorStop(0.42, 'rgba(61, 156, 255, 1)');
  radigrad.addColorStop(0.8, 'rgba(127, 127, 127, 0.6)');
  radigrad.addColorStop(1, 'rgba(127, 127, 127, 1)');

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI*2, true);
  ctx.fillStyle = radigrad;
  ctx.fill();
}

function drawInnerCircle(ctx, x, y, radius){
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI*2, true);
  ctx.fillStyle = 'rgba(61, 156, 255, 1)';
  ctx.fill(); 
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(255, 255, 255)';
  ctx.stroke();
}

function drawRadar(ctx, set) {
  var rad_img = [];
  
  // need rad_posX, rad_posY for now
  for (var j = 0; j < radar_set.length; j++) {
    rad_img[j] = new Image();   
    rad_img[j].src = radar_set[set].items[j];
    rad_img[j].onload = (function(j) {
      ctx.drawImage(rad_img[j], rad_posX, rad_posY, radar_size, radar_size);
    }).bind(this, j); 
  };  
}

function drawIcon(ctx, set){
  var img = [];

  for (var i = 0; i < icon_set[set].items.length; i++) {
    img[i] = new Image();
    img[i].src = icon_set[set].items[i];
    img[i].onload = (function(i) {
      ctx.drawImage(img[i], posX[i], posY[i], icon_size, icon_size);
      }).bind(this, i); 
  };
};

function drawAction(ctx, set){
  var img = [];

  for (var k = 0; k < act_icon_set.length; k++) {
    
    img[k] = new Image();
    img[k].src = act_icon_set[set].items[k];
    img[k].onload = (function(k) {
      ctx.drawImage(img[k], act_posX, act_posY, act_sizeX, act_sizeY);
      }).bind(this, k); 
  };
};

//*******************************************************************//

//identify window orientation
var query = window.matchMedia("(orientation:landscape)");
console.log("Device held " + (query.matches ? "horizontally" : "vertically"));

//default 
let panel_width = (canvas.width-260)/2;
let panel_height = (canvas.height-50);

// explain icon center y coordinate; 
let icon_size = panel_width/5 + 25 ;

let posX = [125, panel_width - (icon_size) + 75, panel_width - (icon_size) + 75, 125];
let posY = [85, 85, panel_height - icon_size + 25, panel_height - icon_size + 25];

let radar_size = panel_width *90/100;
let rad_posX = 100+((panel_width - radar_size)/2);
let rad_posY = 50+((panel_height - radar_size)/2);

let act_sizeX = panel_width * 75/100;
let act_sizeY = act_sizeX * 0.8;
let act_posX = panel_width + 200 + (panel_width - act_sizeX)/2;
let act_posY = 50 + (panel_height - act_sizeY)/2;

if (query.matches) {
  backgroundPanel(c, 100, 50, panel_width, panel_height, 1);
  backgroundPanel(c, panel_width+200, 50, panel_width, panel_height, 2);
} else {
  panel_width = (canvas.width-100);
  panel_height = (canvas.height-120)/2;

  backgroundPanel(c, 50, 50, panel_width, panel_height, 1);
  backgroundPanel(c, 50, panel_height+100, panel_width, panel_height, 2);  
 
  icon_size = panel_height/4 + 30 ;

  posX = [125, panel_width - (icon_size) - 25, panel_width - (icon_size) - 25, 125];
  posY = [85, 85, panel_height - icon_size + 25, panel_height - icon_size + 25];
  
  radar_size = panel_width *60/100;
  rad_posX = 50+((panel_width - radar_size)/2);
  rad_posY = 50+((panel_height - radar_size)/2);
  
  act_sizeX = panel_width * 55/100;
  act_sizeY = act_sizeX * 0.8;
  act_posX = 50 + (panel_width - act_sizeX)/2;
  act_posY = panel_height + 120+ (panel_height - act_sizeY)/2;
}

drawRadar(c, 0);
drawIcon(c, 0);
drawAction(c, 0);

socketio.on('event_connect', function(obj) {
  //c.clearRect(0, 0, canvas.width, canvas.height);
  if (obj != 'hide') {
    console.log('In client side socketio');
    canvas.style.display = "flex";
    c.globalCompositeOperation = 'source-over';
    drawIcon(c, obj);
  } else {
    // c.fillStyle = '#3b3b3b';
    // c.fillRect(0,0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
  
});

const updateEv = () => {
  ['e1', 'e2', 'e3', 'hide'].forEach((id) => {
    const button = document.getElementById(id);
    button.addEventListener('click', () => {
      console.log('clicked', id);
      socketio.emit('Ev', id);
    })
  })
}

updateEv();

