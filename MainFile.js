/* Notes
 * 
 * This is for all the functions for the online
 *
*/

var canvas;
var gc;
var canvasWidth;
var canvasHeight;
var mouseX;
var mouseY;
//var shapeArray;
//var shapeArrayPointer;


// LOCATION CLASS
function Location(initX, initY) {
    this.x = initX;
    this.y = initY;
}

// FOR INITIATING THE PROGRAM
function init() {
    // GET CANVAS SO THAT IT CAN BE USED
    canvas = document.getElementById('main_canvas');
    gc = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    // INITIALIZE NECESSARY VARIABLES
    //shapeArray = new Array();
}

// FOR UPDATING MOUSE CLICKS
function processMouseClick(event) {

}

// FOR UPDATING MOUSE DRAGS
function processMouseDrag(event) {

}

// FOR UPDATING MOUSE MOVEMENTS
function updateMousePosition(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    render();
}

// FOR RENDERING THE CANVAS
function render() {
    //clearCanvas();
}

// FOR CLEARING THE CANVAS
function clearCanvas() {
    gc.clearRect(0, 0, canvasWidth, canvasHeight);
}

// FOR DELETING SELECTED SHAPES
function deleteShape() {

}

// FOR UNDOING AN ACTION
function undoAction() {

}

// FOR REDOING AN ACTION
function redoAction() {

}
