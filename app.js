class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}



function CalculatePoints(radius, pitch, yaw, roll) {

    // Create cube points
    points = findCorners(radius, pitch, yaw, roll);

    // Draw wireframe on canvas
    a = points[0];
    b = points[1];
    c = points[2];
    d = points[3];
    e = points[4];
    f = points[5];
    g = points[6];
    h = points[7];

    lines = [[a, b], [b, c], [c, d], [d,a], [e, f], [f, g], [g, h], [h, e], [a, e], [b, f], [c, g], [d, h]];


    return(lines);
}


function findCorners(radius, pitch, yaw, roll)
{
    // Convert pitch yaw and roll to radians
    pitch = pitch/180 * Math.PI;
    yaw = yaw/180 * Math.PI;
    roll = roll/180 * Math.PI;

    // Define basis vectors
    rightVector = new Vector3(radius, 0, 0);
    upVector = new Vector3(0, radius, 0);
    frontVector = new Vector3(0, 0, radius);


    // Find rotation matrix
    rotation = [
        Math.cos(yaw)*Math.cos(pitch), Math.cos(yaw)*Math.sin(pitch)*Math.sin(roll) - Math.sin(yaw)*Math.cos(roll), Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll) + Math.sin(yaw)*Math.sin(roll),
        Math.sin(yaw)*Math.cos(pitch), Math.sin(yaw)*Math.sin(pitch)*Math.sin(roll) + Math.cos(yaw)*Math.cos(roll), Math.sin(yaw)*Math.sin(pitch)*Math.cos(roll) - Math.cos(yaw)*Math.sin(roll),
        - Math.sin(pitch), Math.cos(pitch)*Math.sin(roll), Math.cos(pitch)*Math.cos(roll),
    ];


    // Rotate vectors via matrix multiplication;
    rightVector = multiplyMatrixAndPoint(rotation, rightVector);
    upVector = multiplyMatrixAndPoint(rotation, upVector);
    frontVector = multiplyMatrixAndPoint(rotation, frontVector);


    a = new Point(rightVector.x + upVector.x + frontVector.x, rightVector.y + upVector.y + frontVector.y, rightVector.z + upVector.z + frontVector.z); // top front right
    b = new Point(rightVector.x + upVector.x - frontVector.x, rightVector.y + upVector.y - frontVector.y, rightVector.z + upVector.z - frontVector.z); // top back right
    c = new Point(- rightVector.x + upVector.x - frontVector.x, - rightVector.y + upVector.y - frontVector.y, - rightVector.z + upVector.z - frontVector.z); // top back left
    d = new Point(- rightVector.x + upVector.x + frontVector.x, - rightVector.y + upVector.y + frontVector.y, - rightVector.z + upVector.z + frontVector.z); // top front left
    e = new Point(rightVector.x - upVector.x + frontVector.x, rightVector.y - upVector.y + frontVector.y, rightVector.z - upVector.z + frontVector.z); // bottom front right
    f = new Point(rightVector.x - upVector.x - frontVector.x, rightVector.y - upVector.y - frontVector.y, rightVector.z - upVector.z - frontVector.z); // bottom back right
    g = new Point(- rightVector.x - upVector.x - frontVector.x, - rightVector.y - upVector.y - frontVector.y, - rightVector.z - upVector.z - frontVector.z); // bottom back left
    h = new Point(- rightVector.x - upVector.x + frontVector.x, - rightVector.y - upVector.y + frontVector.y, - rightVector.z - upVector.z + frontVector.z); // bottom front left


    return [a,b,c,d,e,f,g,h];
}


// function for matrix multiplication
function multiplyMatrixAndPoint(matrix, point) {
    // Extract values from matrix
    c0r0 = matrix[0];
    c1r0 = matrix[1];
    c2r0 = matrix[2];
    c0r1 = matrix[3];
    c1r1 = matrix[4];
    c2r1 = matrix[5];
    c0r2 = matrix[6];
    c1r2 = matrix[7];
    c2r2 = matrix[8];

    // Extract values from point;
    x = point.x;
    y = point.y;
    z = point.z;


    result = new Point(0,0,0);
    result.x = c0r0*x + c1r0*y + c2r0*z;
    result.y = c0r1*x + c1r1*y + c2r1*z;
    result.z = c0r2*x + c1r2*y + c2r2*z;

    return result;
}


function DrawPoints(lines, offsetX, offsetY)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    lines.forEach((points) => {
        start = [points[0].x + 400 + parseInt(offsetX), points[0].y + 400 + parseInt(offsetY)];
        end = [points[1].x + 400 + parseInt(offsetX), points[1].y + 400 + parseInt(offsetY)];
        
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
    });
    ctx.closePath();
    ctx.stroke();
}


function GenerateCube() {
    offsetX = document.getElementById("x").value;
    offsetY = document.getElementById("y").value;
    radius = 100;
    pitch = document.getElementById("pitch").value;
    yaw = document.getElementById("yaw").value;
    roll = document.getElementById("roll").value;
    DrawPoints(CalculatePoints(radius, pitch, yaw, roll), offsetX, offsetY);
}

function RotateCube(pitch, yaw, roll) {
    document.getElementById("pitch").value = (parseInt(document.getElementById("pitch").value) + pitch) % 360;
    document.getElementById("yaw").value = (parseInt(document.getElementById("yaw").value) + yaw) % 360;
    document.getElementById("roll").value = (parseInt(document.getElementById("roll").value) + roll) % 360;

    GenerateCube();
}


let interval;
document.body.onmousedown = function() { 
  interval = setInterval(GenerateCube, 20);
}
document.body.onmouseup = function() {
  clearInterval(interval);
}

let rotating = 0;
let autoPitch = 0;
let autoYaw = 0;
let autoRoll = 0;
let rotateInterval;
function AutoRotate() {
    clearInterval(rotateInterval);1;
    rotateInterval = setInterval(RotateCube, 20, autoPitch, autoYaw, autoRoll);
}

GenerateCube();

