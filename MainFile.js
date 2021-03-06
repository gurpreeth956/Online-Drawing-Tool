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
var cleared;
var selectedShape;
var selectedShapeIndex;
var selectedShapeMoved;
var copiedShape;
var shapeArray;
var shapeArrayPointer;
var undoRedoArray;


// LOCATION CLASS
function Location(initX, initY) {
    this.x = initX;
    this.y = initY;
}

// SHAPE CLASS
function Shape(initType, initX, initY, initFillColor, initLineColor, initLineWidth, initSelect, initDraw, 
        initDeletion, initMoved, initChanged) {
    this.type = initType; // SHAPE TYPE
    this.x = initX; // STARTING X
    this.y = initY; // STARTING Y
    this.fillColor = initFillColor; // FILL COLOR
    this.lineColor = initLineColor; // LINE COLOR
    this.lineWidth = initLineWidth; // LINE WIDTH
    this.selected = initSelect; // IF SELECTED
    this.draw = initDraw; // HELPER FOR DELETION
    this.deletion = initDeletion; // IF DELETION
    this.moved = initMoved; // IF MOVED
    this.changed = initChanged; // IF CHANGED
    this.recent = true; // MOST RECENT SHAPE
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
    document.getElementById('clear').disabled = true;
    document.getElementById('delete').disabled = true;
    document.getElementById('undo').disabled = true;
    document.getElementById('redo').disabled = true;

    // INITIALIZE NECESSARY VARIABLES
    shapeArray = new Array();
    undoRedoArray = new Array();
    shapeArrayPointer = 0;
    selectedShapeIndex = -1;
    isMouseDown = false;
    wasAClick = true;
    clickOnCanvas = false;
    cleared = true;
    selectedShapeMoved = false;
    selectedShape = new Shape(null, null, null, null, null, null , null, null, null, null, null);
    copiedShape = new Shape(null, null, null, null, null, null, null, null, null, null, null);
    
    // DRAW WHITE BACKGROUND
    gc.beginPath();
    gc.fillStyle = '#ffffff';
    gc.fillRect(0, 0, canvas.width, canvas.height);
    gc.stroke();

    // NECESSARY METHODS
    updateAll();
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

    // FOOLPROOF DESIGN FOR CLEAR BUTTON
    if (cleared) {
        document.getElementById('clear').disabled = true;
    } else {
        document.getElementById('clear').disabled = false;
    }

    // FOOLPROOF DESIGN FOR DELETE, COPY AND CUT BUTTONS
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    if ((selectedShapeIndex >= 0 || !(selectedShape.type === null)) && selectionToolValue === 'Selection') {
        document.getElementById('delete').disabled = false;
        document.getElementById('copy').disabled = false;
        document.getElementById('cut').disabled = false;
    } else {
        document.getElementById('delete').disabled = true;
        document.getElementById('copy').disabled = true;
        document.getElementById('cut').disabled = true;
    }

    // FOOLPROOF DESIGN FOR PASTE BUTTON
    if (!(copiedShape.type === null)) {
        document.getElementById('paste').disabled = false;
    } else {
        document.getElementById('paste').disabled = true;
    }

    // FOOLPROOF DESIGN FOR SELECTION
    if (!(selectionToolValue === 'Selection')) {
        selectedShape.selected = false;
    }
}

// FOR SAVE FUNCTION
function save(filename, type) {
    var data = getData();
    var file = new Blob([data], {type : type});
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}

// FOR PUTTING DATA IN SAVABLE FORMAT
function getData() {
    var stuffAdded = false;
    debugger;
    var data = '{\"shapes\": [\n';
    for (var i = 0; i < shapeArray.length; i++) {
        var skipAdd = false;
        stuffAdded = true;
        var currentValue = shapeArray[i];

        // SHAPES NOT TO ADD
        if (currentValue.deletion) {
            if (currentValue.indexofDeletion <= shapeArray.length) {
                skipAdd = true;
            }
        }
        
        if (!skipAdd && currentValue.recent) {
            data += '\t{\n';
            data += '\t\t\"type\": \"' + currentValue.type + '\",\n';
            data += '\t\t\"x\": \"' + currentValue.x + '\",\n';
            data += '\t\t\"y\": \"' + currentValue.y + '\",\n';
            data += '\t\t\"fillcolor\": \"' + currentValue.fillColor + '\",\n';
            data += '\t\t\"linecolor\": \"' + currentValue.lineColor + '\",\n';
            data += '\t\t\"linewidth\": \"' + currentValue.lineWidth + '\",\n';
            if (currentValue.type === 'Line') {
                data += '\t\t\"newX\": \"' + currentValue.newX + '\",\n';
                data += '\t\t\"newY\": \"' + currentValue.newY + '\"\n';
            } else if (currentValue.type === 'Rectangle') {
                data += '\t\t\"width\": \"' + currentValue.width + '\",\n';
                data += '\t\t\"height\": \"' + currentValue.height + '\"\n';
            } else if (currentValue.type === 'Circle') {
                data += '\t\t\"radius\": \"' + currentValue.radius + '\",\n';
                data += '\t\t\"startangle\": \"' + currentValue.startAngle + '\",\n';
                data += '\t\t\"endangle\": \"' + currentValue.endAngle + '\"\n';
            }
            data += '\t},\n';
        }
    }
    if (stuffAdded) {
        data = data.substring(0, data.lastIndexOf(','));
    }
    data += '\n]}';
    return data;
}

// FOR LOAD FUNCTION
function load(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

// TO GET DATA FROM LOADED FILE
function onReaderLoad(event){
    //console.log(event.target.result);
    var data = JSON.parse(event.target.result);
    var count = Object.keys(data).length;

    // CLEAR OUT PREVIOUS DATA
    shapeArray = [];
    undoRedoArray = [];
    shapeArrayPointer = 0;
    selectedShapeIndex = -1;
    isMouseDown = false;
    wasAClick = true;
    clickOnCanvas = false;
    cleared = true;
    selectedShapeMoved = false;
    selectedShape = new Shape(null, null, null, null, null, null , null, null, null, null, null);

    // NOW UPDATE DATA FROM FILE
    for (var i = 0; i < data.shapes.length; i++) {
        var currentShape = data.shapes[i];
        var addShape = new Shape(currentShape.type, parseFloat(currentShape.x), parseFloat(currentShape.y), 
                currentShape.fillcolor, currentShape.linecolor, parseFloat(currentShape.linewidth),
                false, true, false, false, false);
        if (addShape.type === 'Line') {
            addShape.newX = parseFloat(currentShape.newX);
            addShape.newY = parseFloat(currentShape.newY);
        } else if (addShape.type === 'Rectangle') {
            addShape.width = parseFloat(currentShape.width);
            addShape.height = parseFloat(currentShape.height);
        } else if (addShape.type === 'Circle') {
            addShape.radius = parseFloat(currentShape.radius);
            addShape.startAngle = parseFloat(currentShape.startangle);
            addShape.endAngle = parseFloat(currentShape.endangle);
        }
        shapeArray[shapeArrayPointer] = addShape;
        shapeArrayPointer++;
    }
    render();
}

// FOR PRINT FUNCTION
function print() {
    var imgData = canvas.toDataURL("image/jpeg", 1.0);
    var pdf = new jsPDF();
    pdf.addImage(imgData, 'JPEG', 0, 0);
    pdf.save("download.pdf");
}

// FOR COPY FUNCTION
function copy() {
    copiedShape = selectedShape;
    updateAll();
}

// FOR PASTE FUNCTION
function paste() {
    undoRedoArray = [];
    var pastedShape = new Shape(copiedShape.type, copiedShape.x, copiedShape.y, copiedShape.fillColor,
            copiedShape.lineColor, copiedShape.lineWidth, false, true, false, false, false);
    if (copiedShape.type === 'Line') {
        pastedShape.newX = copiedShape.newX;
        pastedShape.newY = copiedShape.newY;
    } else if (copiedShape.type === 'Rectangle') {
        pastedShape.width = copiedShape.width;
        pastedShape.height = copiedShape.height;
    } else if (copiedShape.type === 'Circle') {
        pastedShape.radius = copiedShape.radius;
        pastedShape.startAngle = copiedShape.startAngle;
        pastedShape.endAngle = copiedShape.endAngle;
    }
    shapeArray[shapeArrayPointer] = pastedShape;
    shapeArrayPointer++;
    render();

    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
}

// FOR CUT FUNTION
function cut() {
    copiedShape = selectedShape;
    undoRedoArray = [];
    if (selectedShapeIndex != -1 || !(selectedShape === null)) {
        var currentValue = shapeArray[++selectedShapeIndex];
        currentValue.indexofDeletion = ++shapeArrayPointer;
        currentValue.deletion = true;
        currentValue.draw = false;
        shapeArray.push(currentValue);
        selectedShapeIndex = -1;
        cleared = false;
    }
    render();
    
    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
}

// FOR UPDATING AFTER TOOL CHANGE
function updateSelection() {
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    if (!(selectionToolValue === 'Selection')) {
        document.getElementById('delete').disabled = true;
        selectedShape.selected = false;
        render();
    }
}

// FOR UPDATING SELECTED SHAPE STUFF
function updateShape() {
    selectedShape.changed = true;
    selectedShape.indexOfChange = shapeArrayPointer;
    var fillColor = $('#fillColorChoice');
    selectedShape.fillColor = fillColor.val();
    selectedShape.newFillColor = fillColor.val();
    var lineColor = $('#lineColorChoice');
    selectedShape.lineColor = lineColor.val();
    selectedShape.newLineColor = lineColor.val();
    var widthLine = $('#lineWidthChoice');
    selectedShape.lineWidth = widthLine.val();
    selectedShape.newLineWidth = widthLine.val();
    render();
}

// FOR UPDATING SHAPE POINTER AFTER COLOR CHANGE
function updateShapePointer() {
    selectedShape.oldFillColor = selectedShape.fillColor;
    selectedShape.oldLineColor = selectedShape.lineColor;
    selectedShape.oldLineWidth = selectedShape.lineWidth;
    shapeArray[shapeArrayPointer++] = selectedShape;
}

// FOR UPDATING MOUSE CLICKS
function processMouseClick(event) {
    updateMouseClickPosition(event);
    updateMousePosition(event);
    var location = new Location(mouseX, mouseY);
    
    // REMOVE SELECTED OUTLINE
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    if (selectionToolValue === 'Selection') {
        var currentValue = shapeArray[selectedShapeIndex];
    }

    // NOW ADD TO ARRAY
    if ((!wasAClick && !(selectionToolValue === 'Selection')) || selectedShapeMoved) {
        shapeArrayPointer++;
        wasAClick = true;
        cleared = false;
        selectedShapeMoved = false;
    }

    render();
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
        var currentValue = shapeArray[selectedShapeIndex];
        if (selectedShape.type != null) {
            selectedShapeIndex++;
            if (selectedShapeIndex >= 0 && selectedShapeIndex < shapeArray.length) {
                selectedShape.recent = false;
                var currentValue = shapeArray[selectedShapeIndex];
                currentValue.draw = false;
                const moveShape = new Shape(currentValue.type, currentValue.x + (mouseX - mouseXClick),
                        currentValue.y + (mouseY - mouseYClick), currentValue.fillColor, currentValue.lineColor, 
                        currentValue.lineWidth, currentValue.selected, true, currentValue.deletion, true,
                        currentValue.changed);
                moveShape.moveXDifference = mouseX - mouseXClick;
                moveShape.moveYDifference = mouseY - mouseYClick;
                moveShape.originalShapeIndex = selectedShapeIndex;
                if (moveShape.type === 'Line') {
                    moveShape.newX = currentValue.newX + (mouseX - mouseXClick);
                    moveShape.newY = currentValue.newY + (mouseY - mouseYClick);
                } else if (moveShape.type === 'Rectangle') {
                    moveShape.width = currentValue.width;
                    moveShape.height = currentValue.height;
                } else if (moveShape.type === 'Circle') {
                    moveShape.radius = currentValue.radius;
                    moveShape.startAngle = currentValue.startAngle;
                    moveShape.endAngle = currentValue.endAngle;
                }
                selectedShape.selected = false;
                selectedShape = moveShape;
                selectedShape.selected = true;
                selectedShape.indexOfMoved = shapeArrayPointer + 1;
                shapeArray[shapeArrayPointer] = moveShape;
                selectedShapeMoved = true;
            }
            selectedShapeIndex--;
        }
    } else if (selectionToolValue === 'Line') {
        const lineShape = new Shape('Line', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue,
                false, true, false, false, false);
        lineShape.newX = mouseX;
        lineShape.newY = mouseY;
        shapeArray[shapeArrayPointer] = lineShape;
    } else if (selectionToolValue === 'Rectangle') {
        const rectShape = new Shape('Rectangle', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue,
                false, true, false, false, false);
        rectShape.width = mouseX - mouseXClick;
        rectShape.height = mouseY - mouseYClick;
        shapeArray[shapeArrayPointer] = rectShape;
    } else if (selectionToolValue === 'Circle') {
        const arcShape = new Shape('Circle', mouseXClick, mouseYClick, fillColorValue, lineColorValue, widthLineValue,
                false, true, false, false, false);
        var xDist = mouseX - mouseXClick;
        var yDist = mouseY - mouseYClick;
        var hyp2 = (Math.pow(xDist, 2)) + (Math.pow(yDist, 2));
        var hyp = (Math.sqrt(hyp2));
        arcShape.radius = hyp;
        arcShape.startAngle = 0;
        arcShape.endAngle = 2 * Math.PI;
        shapeArray[shapeArrayPointer] = arcShape;
    }

    cleared = false;
    render();
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
}

// FOR UPDATING MOUSE CLICK POSITION
function updateMouseClickPosition(event) {
    var rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
    mouseXClick = (event.clientX - rect.left) * scaleX;
    mouseYClick = (event.clientY - rect.top) * scaleY;

    // IF SELECTION TOOL IS SELECTED
    var selectionTool = $('#shapeSelect');
    var selectionToolValue = selectionTool.val();
    if (selectionToolValue === 'Selection') {
        selectedShapeIndex = shapeArrayPointer - 1;
        var selectedShapeFound = false;
        selectedShape.selected = false;
        
        // LOOP TO FIND LAST SHAPE THAT CONTAINS POINTS
        while (!selectedShapeFound && selectedShapeIndex >= 0 && shapeArray.length != 0) {
            var currentValue = shapeArray[selectedShapeIndex];
            if (currentValue.draw) {
                if (currentValue.type === 'Line') {
                    var lineSlope = (currentValue.newY - currentValue.y) / (currentValue.newX - currentValue.x);
                    var pointSlope1 = (mouseYClick - currentValue.y) / (mouseXClick - currentValue.x);
                    var pointSlope2 = (mouseYClick - currentValue.newY) / (mouseXClick - currentValue.newX);
                    var difference1 = Math.abs(lineSlope - pointSlope1);
                    var difference2 = Math.abs(lineSlope - pointSlope2);
                    var nearVertical1 = !isFinite(pointSlope1) || Math.abs(pointSlope1) > 20;
                    var nearVertical2 = !isFinite(pointSlope2) || Math.abs(pointSlope2) > 20;
                    var nearHorizontal1 = Math.abs(pointSlope1) < 0.1;
                    var nearHorizontal2 = Math.abs(pointSlope2) < 0.1;

                    // NOW TO FIND THE CURRENT CASE
                    if (difference1 <= 0.1 || difference2 <= 0.1 || nearVertical1 || nearVertical2) {
                        if  (nearVertical1 || nearVertical2) {
                            if (difference1 > 20 || difference2 > 20) {
                                if (currentValue.y < currentValue.newY) {
                                    if (currentValue.y <= mouseYClick && mouseYClick <= currentValue.newY) {
                                        selectedShapeFound = true;
                                        currentValue.selected = true;
                                        selectedShape = currentValue;
                                    }
                                } else {
                                    if (currentValue.y >= mouseYClick && mouseYClick >= currentValue.newY) {
                                        selectedShapeFound = true;
                                        currentValue.selected = true;
                                        selectedShape = currentValue;
                                    }
                                }
                            }
                        } else if (nearHorizontal1 || nearHorizontal2) {
                            if (difference1 < 0.1 || difference2 < 0.1) {
                                if (currentValue.x < currentValue.newX) {
                                    if (currentValue.x <= mouseXClick && mouseXClick <= currentValue.newX) {
                                        selectedShapeFound = true;
                                        currentValue.selected = true;
                                        selectedShape = currentValue;
                                    }
                                } else {
                                    if (currentValue.x >= mouseXClick && mouseXClick >= currentValue.newX) {
                                        selectedShapeFound = true;
                                        currentValue.selected = true;
                                        selectedShape = currentValue;
                                    }
                                }
                            }
                        } else if (currentValue.newX >= currentValue.x && currentValue.newY >= currentValue.y) {
                            if (currentValue.x <= mouseXClick && mouseXClick <= currentValue.newX &&
                                currentValue.y <= mouseYClick && mouseYClick <= currentValue.newY) {
                                    selectedShapeFound = true;
                                    currentValue.selected = true;
                                    selectedShape = currentValue;
                            }
                        } else if (currentValue.newX < currentValue.x && currentValue.newY >= currentValue.y) {
                            if (currentValue.x >= mouseXClick && mouseXClick >= currentValue.newX &&
                                currentValue.y <= mouseYClick && mouseYClick <= currentValue.newY) {
                                    selectedShapeFound = true;
                                    currentValue.selected = true;
                                    selectedShape = currentValue;
                            }
                        } else if (currentValue.newX < currentValue.x && currentValue.newY < currentValue.y) {
                            if (currentValue.x >= mouseXClick && mouseXClick >= currentValue.newX &&
                                currentValue.y >= mouseYClick && mouseYClick >= currentValue.newY) {
                                    selectedShapeFound = true;
                                    currentValue.selected = true;
                                    selectedShape = currentValue;
                            }
                        } else {
                            if (currentValue.x <= mouseXClick && mouseXClick <= currentValue.newX &&
                                currentValue.y >= mouseYClick && mouseYClick >= currentValue.newY) {
                                    selectedShapeFound = true;
                                    currentValue.selected = true;
                                    selectedShape = currentValue;
                            }
                        }
                    }
                } else if (currentValue.type === 'Rectangle') {
                    if (currentValue.width >= 0 && currentValue.height >= 0) {
                        if (currentValue.x <= mouseXClick && mouseXClick <= (currentValue.x + currentValue.width) &&
                            currentValue.y <= mouseYClick && mouseYClick <= (currentValue.y + currentValue.height)) {
                                selectedShapeFound = true;
                                currentValue.selected = true;
                                selectedShape = currentValue;
                        }
                    } else if (currentValue.width >= 0 && currentValue.height < 0) {
                        if (currentValue.x <= mouseXClick && mouseXClick <= (currentValue.x + currentValue.width) &&
                            currentValue.y  + currentValue.height <= mouseYClick && mouseYClick <= currentValue.y) {
                                selectedShapeFound = true;
                                currentValue.selected = true;
                                selectedShape = currentValue;
                        }
                    } else if (currentValue.width < 0 && currentValue.height >= 0) {
                        if ((currentValue.x + currentValue.width) <= mouseXClick && mouseXClick <= currentValue.x &&
                            currentValue.y <= mouseYClick && mouseYClick <= (currentValue.y + currentValue.height)) {
                                selectedShapeFound = true;
                                currentValue.selected = true;
                                selectedShape = currentValue;
                        }
                    } else {
                        if ((currentValue.x + currentValue.width) <= mouseXClick && mouseXClick <= currentValue.x &&
                            (currentValue.y + currentValue.height) <= mouseYClick && mouseYClick <= currentValue.y) {
                                selectedShapeFound = true;
                                currentValue.selected = true;
                                selectedShape = currentValue;
                        }
                    }
                } else if (currentValue.type === 'Circle') {
                    var dist = Math.sqrt(Math.pow(mouseXClick - currentValue.x, 2) + Math.pow(mouseYClick - currentValue.y, 2))
                    if (dist <= currentValue.radius) {
                        selectedShapeFound = true;
                        currentValue.selected = true;
                        selectedShape = currentValue;
                    }
                }
            }
            if (!selectedShapeFound) {
                selectedShape = new Shape(null, null, null, null, null, null, false, null, null, null, null);
            } else {
                // UPDATE TOP BAR VALUES
                var fillColor = selectedShape.fillColor;
                var fillColorElement = document.getElementById('fillColorChoice');
                fillColorElement.value = fillColor;
                var lineColor = selectedShape.lineColor;
                var lineColorElement = document.getElementById('lineColorChoice');
                lineColorElement.value = lineColor;
                var lineWidth = selectedShape.lineWidth;
                var lineWidthElement = document.getElementById('lineWidthChoice');
                lineWidthElement.value = lineWidth;
            }
            selectedShapeIndex--;
            render();
        }
    }
}

// FOR RENDERING THE CANVAS
function render() {
    clearCanvas();

    // DRAW WHITE BACKGROUND
    gc.beginPath();
    gc.fillStyle = '#ffffff';
    gc.fillRect(0, 0, canvas.width, canvas.height);
    gc.stroke();

    // DRAW ALL SHAPES IN ARRAY
    for (var i = 0; i < shapeArray.length; i++) {
        var currentValue = shapeArray[i];
        if (currentValue.draw) {
            if (currentValue.type === 'Line') {
                if (currentValue.selected) {
                    gc.strokeStyle = '#0dd5fc';
                    gc.setLineDash([5, 4]);
                    gc.beginPath();
                    gc.moveTo(currentValue.x, currentValue.y);
                    gc.lineTo(currentValue.newX, currentValue.newY);
                    gc.lineWidth = currentValue.lineWidth * 2;
                    gc.stroke();
                } else {
                    gc.strokeStyle = currentValue.lineColor;
                    gc.setLineDash([0, 0]);
                    gc.beginPath();
                    gc.moveTo(currentValue.x, currentValue.y);
                    gc.lineTo(currentValue.newX, currentValue.newY);
                    gc.lineWidth = currentValue.lineWidth;
                    gc.stroke();
                }
            } else if (currentValue.type === 'Rectangle') {
                if (currentValue.selected) {
                    gc.fillStyle = currentValue.fillColor;
                    gc.strokeStyle = '#0dd5fc';
                    gc.setLineDash([5, 4]);
                    gc.beginPath();
                    gc.fillRect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
                    gc.rect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
                    gc.lineWidth = currentValue.lineWidth * 2;
                    gc.stroke();
                } else {
                    gc.fillStyle = currentValue.fillColor;
                    gc.strokeStyle = currentValue.lineColor;
                    gc.setLineDash([0, 0]);
                    gc.beginPath();
                    gc.fillRect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
                    gc.rect(currentValue.x, currentValue.y, currentValue.width, currentValue.height);
                    gc.lineWidth = currentValue.lineWidth;
                    gc.stroke();
                }
            } else if (currentValue.type === 'Circle') {
                if (currentValue.selected) {
                    gc.fillStyle = currentValue.fillColor;
                    gc.strokeStyle = '#0dd5fc';
                    gc.setLineDash([5, 4]);
                    gc.beginPath();
                    gc.arc(currentValue.x, currentValue.y, currentValue.radius, currentValue.startAngle, currentValue.endAngle);
                    gc.lineWidth = currentValue.lineWidth * 2;
                    gc.stroke();
                    gc.fill();
                } else {
                    gc.fillStyle = currentValue.fillColor;
                    gc.strokeStyle = currentValue.lineColor;
                    gc.setLineDash([0, 0]);
                    gc.beginPath();
                    gc.arc(currentValue.x, currentValue.y, currentValue.radius, currentValue.startAngle, currentValue.endAngle);
                    gc.lineWidth = currentValue.lineWidth;
                    gc.stroke();
                    gc.fill();
                }
            }
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
    undoRedoArray = [];
    const rectShape = new Shape('Rectangle', 0, 0, '#ffffff', '#ffffff', 1, false, true, false, false, false);
    rectShape.width = canvas.width;
    rectShape.height = canvas.height;;
    shapeArray[shapeArrayPointer] = rectShape;
    shapeArrayPointer++;
    cleared = true;
    render();

    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
}

// FOR DELETING SELECTED SHAPES
function deleteShape() {
    undoRedoArray = [];
    var currentValue = shapeArray[++selectedShapeIndex];
    currentValue.indexofDeletion = ++shapeArrayPointer;
    currentValue.deletion = true;
    currentValue.draw = false;
    shapeArray.push(currentValue);
    selectedShapeIndex = -1;
    cleared = false;
    deleted = true;
    render();
    
    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
}

// FOR UNDOING AN ACTION
function undoAction() {
    var currentValue = shapeArray.pop();
    undoRedoArray.push(currentValue);
    var wasADeletion = false;
    var wasAMoved = false;
    if (currentValue.deletion) {
        if (shapeArrayPointer == currentValue.indexofDeletion) {
            currentValue.draw = true;
            wasADeletion = true;
        }
    }
    if (currentValue.moved && !wasADeletion) {
        if (shapeArrayPointer == currentValue.indexOfMoved) {
            shapeArray[currentValue.originalShapeIndex].draw = true;
            currentValue.x -= currentValue.moveXDifference;
            currentValue.y -= currentValue.moveYDifference;
            if (currentValue.type === 'Line') {
                currentValue.newX -= currentValue.moveXDifference;
                currentValue.newY -= currentValue.moveYDifference;
            }
            wasAMoved = true;
        }
    }
    if (currentValue.changed && !wasADeletion && !wasAMoved) {
        if (shapeArrayPointer == currentValue.indexOfChange) {
            currentValue.fillColor = currentValue.oldFillColor;
            currentValue.lineColor = currentValue.oldLineColor;
            currentValue.lineWidth = currentValue.oldLineWidth;
        }
    }
    selectedShape.selected = false;
    shapeArrayPointer--;
    cleared = false;
    render();

    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
}

// FOR REDOING AN ACTION
function redoAction() {
    var currentValue = undoRedoArray.pop();
    shapeArray.push(currentValue);
    shapeArrayPointer++;
    var wasADeletion = false;
    var wasAMoved = false;
    if (currentValue.deletion) {
        if (shapeArrayPointer == currentValue.indexofDeletion) {
            currentValue.draw = false;
            wasADeletion = true;
        }
    } 
    if (currentValue.moved && !wasADeletion) {
        if (shapeArrayPointer == currentValue.indexOfMoved) {
            shapeArray[currentValue.originalShapeIndex].draw = false;
            currentValue.x += currentValue.moveXDifference;
            currentValue.y += currentValue.moveYDifference;
            if (currentValue.type === 'Line') {
                currentValue.newX += currentValue.moveXDifference;
                currentValue.newY += currentValue.moveYDifference;
            }
            wasAMoved = true;
        }
    }
    if (currentValue.changed && !wasADeletion && !wasAMoved) {
        if (shapeArrayPointer == currentValue.indexOfChange) {
            currentValue.fillColor = currentValue.newFillColor;
            currentValue.lineColor = currentValue.newLineColor;
            currentValue.lineWidth = currentValue.newLineWidth;
        }
    }
    selectedShape.selected = false;
    cleared = false;
    render();

    // UPDATE CERTAIN BUTTON DISABLES
    document.getElementById('delete').disabled = true;
    document.getElementById('copy').disabled = true;
    document.getElementById('cut').disabled = true;
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
