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

function FindPoints(radius, pitch, yaw, roll) {
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

    return [a, b, c, d, e, f, g, h];
}

function FindEdges(radius, pitch, yaw, roll)
{
    points = FindPoints(radius, pitch, yaw, roll);
    a = points[0];
    b = points[1];
    c = points[2];
    d = points[3];
    e = points[4];
    f = points[5];
    g = points[6];
    h = points[7];

    edges = [[a, b], [b, c], [c, d], [d,a], [e, f], [f, g], [g, h], [h, e], [a, e], [b, f], [c, g], [d, h]];    
    return edges;
}

function FindFaces(radius, pitch, yaw, roll)
{
    points = FindPoints(radius, pitch, yaw, roll);
    a = points[0];
    b = points[1];
    c = points[2];
    d = points[3];
    e = points[4];
    f = points[5];
    g = points[6];
    h = points[7];

    faceA = VisibleFace([a, b, c, d], [e, f, g, h]);
    faceB = VisibleFace([c, d, h, g], [a, b, f, e]);
    faceC = VisibleFace([b, c, g, f], [a, d, h, e]);

    faces = [[faceA, "rgba(255, 255, 0)"], [faceB, "rgba(255, 0, 255)"], [faceC, "rgba(0, 255, 255)"]];
    return faces;
}

function VisibleFace(a, b)
{
    zA = (a[0].z + a[1].z + a[2].z + a[3].z) / 4;
    zB = (b[0].z + b[1].z + b[2].z + b[3].z) / 4;

    if (zA > zB) {
        return a;
    } else {
        return b;
    }
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


function RenderPolygonEdges(edges, perspectiveMult = 1)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    edges.forEach((edge) => {
        foreshortening = (1 / (perspectiveMult ** (-edge[0].z/400)));
        start = [edge[0].x * foreshortening + 400, edge[0].y * foreshortening + 400];
        foreshortening = (1 / (perspectiveMult ** (-edge[1].z/400)));
        end = [edge[1].x * foreshortening + 400, edge[1].y * foreshortening + 400];
        
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
    });
    ctx.closePath();
    ctx.stroke();
}

function RenderPolygonFaces(faces, perspectiveMult = 1) {
    faces.sort(sortFacesByZ);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    faces.forEach((face) => {
        ctx.beginPath();
        foreshortening = (1 / (perspectiveMult ** (-face[0][0].z/400)));
        a = [face[0][0].x * foreshortening + 400, face[0][0].y * foreshortening + 400];
        foreshortening = (1 / (perspectiveMult ** (-face[0][1].z/400)));
        b = [face[0][1].x * foreshortening + 400, face[0][1].y * foreshortening + 400];
        foreshortening = (1 / (perspectiveMult ** (-face[0][2].z/400)));
        c = [face[0][2].x * foreshortening + 400, face[0][2].y * foreshortening + 400];
        foreshortening = (1 / (perspectiveMult ** (-face[0][3].z/400)));
        d = [face[0][3].x * foreshortening + 400, face[0][3].y * foreshortening + 400];
        
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(d[0], d[1]);
        ctx.lineTo(a[0], a[1]);
        ctx.closePath();
        ctx.fillStyle = face[1];
        ctx.fill();
    });
}
function logAverageZ(faces) {
    faces.forEach((face) => {
        console.log(averageZ(face[0]));
    });
}

function averageZ(face) {
    return (face[0].z + face[1].z + face[2].z + face[3].z)/4;
}

function sortFacesByZ(a, b) {
    if (averageZ(a[0]) > averageZ(b[0])) {
        return 1;
    } else {
        return -1;
    }

}

function GenerateCubeEdges() {
    radius = 100;
    pitch = document.getElementById("pitch").value;
    yaw = document.getElementById("yaw").value;
    roll = document.getElementById("roll").value;
    RenderPolygonEdges(FindEdges(radius, pitch, yaw, roll), perspectiveMult);
}

function GenerateCubeFaces() {
    radius = 100;
    pitch = document.getElementById("pitch").value;
    yaw = document.getElementById("yaw").value;
    roll = document.getElementById("roll").value;
    RenderPolygonFaces(FindFaces(radius, pitch, yaw, roll), perspectiveMult);
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
    if (autoPitch || autoYaw || autoRoll) {
        rotateInterval = setInterval(RotateCube, 20, autoPitch, autoYaw, autoRoll);
    }
}

let cubeType = 1;
function GenerateCube() {
    perspectiveMult = document.getElementById("perspective").value;
    if (cubeType == 0) {
        GenerateCubeEdges();
    } else if (cubeType == 1) {
        GenerateCubeFaces();
    }
}

function setCubeType(n) {
    cubeType = n;
    GenerateCube();
}


let perspectiveMult = 5;
GenerateCube();
