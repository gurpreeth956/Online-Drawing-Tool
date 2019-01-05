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
var realMouseX;
var realMouseY;
var isMouseDown;
var wasAClick;
var clickOnCanvas;
var shapeArray;
var shapeArrayPointer;
var undoRedoArray;


// LOCATION CLASS
function Location(initX, initY) {
    this.x = initX;
    this.y = initY;
}

// SHAPE CLASS
function Shape(initType, initX, initY, initFillColor, initLineColor, initLineWidth) {
    this.type = initType;
    this.x = initX;
    this.y = initY;
    this.fillColor = initFillColor;
    this.lineColor = initLineColor;
    this.lineWidth = initLineWidth;
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
    wasAClick = true;
    clickOnCanvas = false;

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
    if (!wasAClick) {
        shapeArrayPointer++;
        wasAClick = true;
    }
}

// FOR UPDATING MOUSE DRAGS
function processMouseDrag(event) {
    // UPDATE OTHER REQUIRED ELEMENTS
    undoRedoArray = [];
    wasAClick = false;

    // GET NECESSARY DATA USING ID
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    var fillColor = $('#fillColorChoice');
    var fillColorValue = fillColor.val();
    var lineColor = $('#lineColorChoice');
    var lineColorValue = lineColor.val();
    var widthLine = $('#lineWidthChoice');
    var widthLineValue = widthLine.val();
    
    // NOW TO DO ACTION BASED ON SELECTION
    if (selectionToolValue === 'Selection') {
        
    } else if (selectionToolValue === 'Line') {
        const lineShape = new Shape('Line', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue);
        lineShape.newX = mouseX;
        lineShape.newY = mouseY;
        shapeArray[shapeArrayPointer] = lineShape;
    } else if (selectionToolValue === 'Rectangle') {
        const rectShape = new Shape('Rectangle', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue);
        rectShape.width = mouseX - mouseXClick;
        rectShape.height = mouseY - mouseYClick;
        shapeArray[shapeArrayPointer] = rectShape;
    } else if (selectionToolValue === 'Circle') {
        const arcShape = new Shape('Circle', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue);
        var xDist = mouseX - mouseXClick;
        var yDist = mouseY - mouseYClick;
        var hyp2 = (Math.pow(xDist, 2)) + (Math.pow(yDist, 2));
        var hyp = (Math.sqrt(hyp2));
        arcShape.radius = hyp;
        arcShape.startAngle = 0;
        arcShape.endAngle = 2 * Math.PI;
        shapeArray[shapeArrayPointer] = arcShape;
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
            //if (clickOnCanvas) {
                mouseX = (event.clientX - rect.left) * scaleX;
                mouseY = (event.clientY - rect.top) * scaleY;
                processMouseDrag(event);
            //}
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

    /*var rect = canvas.getBoundingClientRect();
    realMouseX = e.pageX;
    realMouseY = e.pageY;

    if (realMouseX <= rect.left) {
        mouseXClick = rect.left;
    }
    if (realMouseX >= rect.right) {
        mouseXClick = rect.right;
    }
    if (realMouseY <= rect.top) {
        mouseYClick = rect.top;
    }
    if (realMouseY >= rect.bottom) {
        mouseYClick = rect.bottom;
    }*/
    
    /*$(function() {
        $('body').click(function(e) {
            if (e.target.id === 'theCanvas' || $(e.target).parents('#theCanvas').length) {
                clickOnCanvas = true;
            } else {
                clickOnCanvas = false;
            }
        });
    });*/
}

// FOR RENDERING THE CANVAS
function render() {
    clearCanvas(); // remove this for matrix functions
    for (var i = 0; i < shapeArray.length; i++) {
        var currentValue = shapeArray[i];
        if (currentValue.type === 'Selection') {

        } else if (currentValue.type === 'Line'){
            gc.strokeStyle = currentValue.lineColor;
            gc.beginPath();
            gc.moveTo(currentValue.x, currentValue.y);
            gc.lineTo(currentValue.newX, currentValue.newY);
            gc.lineWidth = currentValue.lineWidth;
            gc.stroke();
        } else if (currentValue.type === 'Rectangle') {
            gc.fillStyle = currentValue.fillColor;
            gc.strokeStyle = currentValue.lineColor;
            gc.beginPath();
            gc.fillRect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
            gc.rect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
            gc.lineWidth = currentValue.lineWidth;
            gc.stroke();
        } else if (currentValue.type === 'Circle') {
            gc.fillStyle = currentValue.fillColor;
            gc.strokeStyle = currentValue.lineColor;
            gc.beginPath();
            gc.arc(currentValue.x, currentValue.y, currentValue.radius, currentValue.startAngle, currentValue.endAngle);
            gc.lineWidth = currentValue.lineWidth;
            gc.stroke();
            gc.fill();
        }
    }
}

// FOR CLEARING THE CANVAS
function clearCanvas() {
    gc.clearRect(0, 0, canvasWidth, canvasHeight);
    updateAll();
}

// FOR CLEARING BY CLEAR BUTTON
function clearAll() {
    const rectShape = new Shape('Rectangle', 0, 0, '#ffffff', '#ffffff', 1);
    rectShape.width = canvas.width;
    rectShape.height = canvasHeight;;
    shapeArray[shapeArrayPointer] = rectShape;
    shapeArrayPointer++;
    render();
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
