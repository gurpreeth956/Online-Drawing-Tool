/* Notes
 * 
 * This is for all the functions for the online
 *
*/

var canvas;
var gc;
var canvasWidth;
var canvasHeight;
var scaleX;
var scaleY;
var mouseX;
var mouseY;
var mouseXClick;
var mouseYClick;
var isMouseDown;
var shapeArray;
var shapeArrayPointer;
var undoRedoArray;


// LOCATION CLASS
function Location(initX, initY) {
    this.x = initX;
    this.y = initY;
}

// SHAPE CLASS
function Shape(initType, initX, initY, initFillColor, initLineColor) {
    this.type = initType;
    this.x = initX;
    this.y = initY;
    this.fillColor = initFillColor;
    this.lineColor = initLineColor;
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
    undoRedoArray = new Array();
    shapeArrayPointer = 0;
    isMouseDown = false;

    // NECESSARY METHODS
}

// FOR UPDATING IMPORTANT FEATURES
function updateAll() {
    // FOOLPROOF DESIGN FOR UNDO BUTTON
    if (shapeArray.length > 0) {
        document.getElementById('undo').disabled = false;
    } else {
        document.getElementById('undo').disabled = true;
    }

    // FOOLPROOF DESIGN FOR REDO BUTTON
    if (undoRedoArray.length > 0) {
        document.getElementById('redo').disabled = false;
    } else {
        document.getElementById('redo').disabled = true;
    }
}

// FOR UPDATING MOUSE CLICKS
function processMouseClick(event) {
    updateMouseClickPosition(event);
    updateMousePosition(event);
    var location = new Location(mouseX, mouseY);
    //need to fix to make sure shape is added
    shapeArrayPointer++;
}

// FOR UPDATING MOUSE DRAGS
function processMouseDrag(event) {
    // GET NECESSARY DATA USING ID
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    var fillColor = $('#fillColorChoice');
    var fillColorValue = fillColor.val();
    var lineColor = $('#lineColorChoice');
    var lineColorValue = lineColor.val();

    // NOW TO DO ACTION BASED ON SELECTION
    if (selectionToolValue === 'Selection') {
        
    } else if (selectionToolValue === 'Line') {
        
    } else if (selectionToolValue === 'Rectangle') {
        const rectShape = new Shape('Rectangle', mouseXClick, mouseYClick, fillColorValue, lineColorValue)
        rectShape.width = mouseX - mouseXClick;
        rectShape.height = mouseY - mouseYClick;
        shapeArray[shapeArrayPointer] = rectShape;
        //gc.beginPath();
        //gc.fillRect(mouseXClick, mouseYClick, mouseX - mouseXClick, mouseY - mouseYClick);
        //gc.rect(mouseXClick, mouseYClick, mouseX - mouseXClick, mouseY - mouseYClick);
        //gc.stroke();
    } else if (selectionToolValue === 'Circle') {
        
    } else if (selectionToolValue === 'Triangle') {
        
    }
    render();

    updateAll();
}

// FOR UPDATING MOUSE MOVEMENTS
function updateMousePosition(event) {
    var rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
    mouseX = (event.clientX - rect.left) * scaleX;
    mouseY = (event.clientY - rect.top) * scaleY;

    // FOR MOUSE DRAGGING
    document.onmousedown = function() { isMouseDown = true };
    document.onmouseup = function() { isMouseDown = false };
    document.onmousemove = function() { 
        if (isMouseDown) {
            mouseX = (event.clientX - rect.left) * scaleX;
            mouseY = (event.clientY - rect.top) * scaleY;
            processMouseDrag(event);
        }
    }

    updateAll();
}

// FOR UPDATING MOUSE CLICK POSITION
function updateMouseClickPosition(event) {
    var rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
    mouseXClick = (event.clientX - rect.left) * scaleX;
    mouseYClick = (event.clientY - rect.top) * scaleY;
}

// FOR RENDERING THE CANVAS
function render() {
    clearCanvas();
    for (var i = 0; i < shapeArray.length; i++) {
        var currentValue = shapeArray[i];
        if (currentValue.type === 'Rectangle') {
            gc.fillStyle = currentValue.fillColor;
            gc.strokeStyle = currentValue.lineColor;
            gc.beginPath();
            gc.fillRect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
            gc.rect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
            gc.stroke();
        }
    }
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
    undoRedoArray.push(shapeArray.pop());
    shapeArrayPointer--;
    render();
    updateAll();
}

// FOR REDOING AN ACTION
function redoAction() {
    shapeArray.push(undoRedoArray.pop());
    shapeArrayPointer++;
    render();
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
