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



function CalculatePoints(center, radius, pitch, yaw, roll) {

    center = new Point(0,0,0);

    // Create cube points
    points = findCorners(center, radius, pitch, yaw, roll);

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


function findCorners(center, radius, pitch, yaw, roll)
{
    // Convert pitch yaw and roll to radians
    pitch = pitch/180 * Math.PI;
    yaw = yaw/180 * Math.PI;
    roll = roll/180 * Math.PI;

    // Define basis vectors
    rightVector = new Vector3(radius, 0, 0);
    upVector = new Vector3(0, radius, 0);
    frontVector = new Vector3(0, 0, radius);


    // Find rotation matrices
    pitch = [
        1,0,0,
        0,Math.cos(pitch),-Math.sin(pitch),
        0,Math.sin(pitch),Math.cos(pitch),
    ];

    yaw = [
        Math.cos(yaw),0,Math.sin(yaw),
        0,1,0,
        -Math.sin(yaw),0,Math.cos(yaw),
    ];

    roll = [
        Math.cos(roll),-Math.sin(roll),0,
        Math.sin(roll),Math.cos(roll),0,
        0,0,1,
    ];

    // Combine rotation vectors
    rollPitch = multiplyMatrices(roll, pitch);
    rotation = multiplyMatrices(rollPitch, yaw);

    // Rotate vectors via matrix multiplication;
    rightVector = multiplyMatrixAndPoint(rotation, rightVector);
    upVector = multiplyMatrixAndPoint(rotation, upVector);
    frontVector = multiplyMatrixAndPoint(rotation, frontVector);
    console.log(rightVector);
    console.log(upVector);
    console.log(frontVector);

    a = new Point(rightVector.x + upVector.x + frontVector.x, rightVector.y + upVector.y + frontVector.y, rightVector.z + upVector.z + frontVector.z); // top front right
    b = new Point(rightVector.x + upVector.x - frontVector.x, rightVector.y + upVector.y - frontVector.y, rightVector.z + upVector.z - frontVector.z); // top back right
    c = new Point(- rightVector.x + upVector.x - frontVector.x, - rightVector.y + upVector.y - frontVector.y, - rightVector.z + upVector.z - frontVector.z); // top back left
    d = new Point(- rightVector.x + upVector.x + frontVector.x, - rightVector.y + upVector.y + frontVector.y, - rightVector.z + upVector.z + frontVector.z); // top front left
    e = new Point(rightVector.x - upVector.x + frontVector.x, rightVector.y - upVector.y + frontVector.y, rightVector.z - upVector.z + frontVector.z); // bottom front right
    f = new Point(rightVector.x - upVector.x - frontVector.x, rightVector.y - upVector.y - frontVector.y, rightVector.z - upVector.z - frontVector.z); // bottom back right
    g = new Point(- rightVector.x - upVector.x - frontVector.x, - rightVector.y - upVector.y - frontVector.y, - rightVector.z - upVector.z - frontVector.z); // bottom back left
    h = new Point(- rightVector.x - upVector.x + frontVector.x, - rightVector.y - upVector.y + frontVector.y, - rightVector.z - upVector.z + frontVector.z); // bottom front left

    console.log(a);
    console.log(b);
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

// function to combine rotation matrices
function multiplyMatrices(a, b) {
    // Element-wise matrix multiplication
    c = [
        (a[0]*b[0] + a[1]*b[3] + a[2]*b[6]), (a[0]*b[1] + a[1]*b[4] + a[2]*b[7]), (a[0]*b[2] + a[1]*b[5] + a[2]*b[8]),
        (a[3]*b[0] + a[4]*b[3] + a[5]*b[6]), (a[3]*b[1] + a[4]*b[4] + a[5]*b[7]), (a[3]*b[2] + a[4]*b[5] + a[5]*b[8]),
        (a[6]*b[0] + a[7]*b[3] + a[8]*b[6]), (a[6]*b[1] + a[7]*b[4] + a[8]*b[7]), (a[6]*b[2] + a[7]*b[5] + a[8]*b[8]),
    ];

    return c;
}

function DrawPoints(lines)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    lines.forEach((points) => {
        start = [points[0].x + 400, points[0].y + 400];
        end = [points[1].x + 400, points[1].y + 400];
        
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
    });
    ctx.closePath();
    ctx.stroke();
}


function GenerateCube() {
    center = new Point(0,0,0);
    radius = 100;
    pitch = document.getElementById("pitch").value;
    yaw = document.getElementById("yaw").value;
    roll = document.getElementById("roll").value;
    DrawPoints(CalculatePoints(center, radius, pitch, yaw, roll));
}



setInterval(GenerateCube, 20);