
var vertexShaderText =
    `
precision mediump float;
attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;
void main () 
{
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
`
var fragmentShaderText =
    `
precision mediump float;

varying vec3 fragColor;
void main () 
{
    gl_FragColor = vec4(fragColor, 1.0);
}
`

var initDemo = function () {
    console.log('working', new Date().toString());
    var canvas = document.getElementById('canvas-surface');
    if (!canvas) {
        console.log('no canvas');
    }

    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('using experimental');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('browser not support webgl');
    }

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // gl.viewport(
    //     //position
    //     Math.trunc(window.innerWidth / 4),
    //     Math.trunc(window.innerHeight / 4),
    //     // surface
    //     window.innerWidth / 2,
    //     innerHeight / 2);
    //gl.clearColor(R,G,B,A);
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //define
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //compile
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compile vertexShader",
            gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compile fragment",
            gl.getShaderInfoLog(fragmentShader));
        return;
    }


    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program",
            gl.getProgramInfoLog(program));
        return;
    }

    //validate program - dev only no production;
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program",
            gl.getProgramInfoLog(program));
        return;
    }

    // create buffer

    var triangleVertices =
        [
            // X, Y , R, G, B
            0.0, 0.4, 1.0, 1.0, 0.0,
            -0.5, -0.5, 0.0, 1.0, 1.0,
            0.5, -0.5, 1.0, 0.0, 1.0
        ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(triangleVertices),
        gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttrLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0);

    gl.vertexAttribPointer(
        colorAttrLocation,
        3,
        gl.FLOAT,
        false,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttrLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length);

};
