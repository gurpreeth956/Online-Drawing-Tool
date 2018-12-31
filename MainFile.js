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
var shapeArray;
var shapeArrayPointer;


// LOCATION CLASS
function Location(initX, initY) {
    this.x = initX;
    this.y = initY;
}

// FOR INITIATING THE PROGRAM
function init() {
    // GET CANVAS SO THAT IT CAN BE USED
    canvas = document.getElementById('theCanvas');
    gc = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    // DISABLING INITIAL FEATURES
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
    document.getElementById('paste').disabled = true;
    document.getElementById('delete').disabled = true;
    document.getElementById('undo').disabled = true;
    document.getElementById('redo').disabled = true;

    // INITIALIZE NECESSARY VARIABLES
    shapeArray = new Array();
    shapeArrayPointer = 0;
}

// FOR UPDATING IMPORTANT FEATURES
function updateAll() {
    // FOOLPROOF DESIGN FOR UNDO BUTTON
    if (shapeArrayPointer > 0) {
        document.getElementById('undo').disabled = false;
    } else {
        document.getElementById('undo').disabled = true;
    }

    // FOOLPROOF DESIGN FOR REDO BUTTON
    if (shapeArrayPointer < shapeArray.length - 1) {
        document.getElementById('redo').disabled = false;
    } else {
        document.getElementById('redo').disabled = true;
    }
}

// FOR UPDATING MOUSE CLICKS
function processMouseClick(event) {
    updateAll();
}

// FOR UPDATING MOUSE DRAGS
function processMouseDrag(event) {
    updateAll();
}

// FOR UPDATING MOUSE MOVEMENTS
function updateMousePosition(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    render();

    updateAll();
}

// FOR RENDERING THE CANVAS
function render() {
    //clearCanvas();
}

// FOR CLEARING THE CANVAS
function clearCanvas() {
    gc.clearRect(0, 0, canvasWidth, canvasHeight);
    updateAll();
}

// FOR DELETING SELECTED SHAPES
function deleteShape() {
    updateAll();
}

// FOR UNDOING AN ACTION
function undoAction() {
    shapeArrayPointer--;
    updateAll();
}

// FOR REDOING AN ACTION
function redoAction() {
    shapeArrayPointer++;
    updateAll();
}

// FOR ONLY ALLOWING NUMBERS TO BE ENTERRED IN LINE WIDTH TEXTFIELD
function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}
