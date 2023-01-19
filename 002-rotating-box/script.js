
var vertexShaderText =
    `
precision mediump float;
attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

void main () 
{
    fragColor = vertColor;
    gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);
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
var fraction = 6;

const coordWithColor = function () { // a flat array of tupple of six items with color;
    const color = function () {
        return [
            Math.floor(Math.random() * 1000) / 1000,
            Math.floor(Math.random() * 1000) / 1000,
            Math.floor(Math.random() * 1000) / 1000];
    }

    return [
        [ //top
            [-1.0, 1.0, -1.0],
            [-1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0],
            [1.0, 1.0, -1.0],
        ],
        [ //left
            [-1.0, 1.0, 1.0],
            [-1.0, -1.0, 1.0],
            [-1.0, -1.0, -1.0],
            [-1.0, 1.0, -1.0],
        ],
        [ //right
            [1.0, 1.0, 1.0],
            [1.0, -1.0, 1.0],
            [1.0, -1.0, -1.0],
            [1.0, 1.0, -1.0],
        ],
        [ //front
            [1.0, 1.0, 1.0],
            [1.0, -1.0, 1.0],
            [-1.0, -1.0, 1.0],
            [-1.0, 1.0, 1.0],
        ],
        [ //back
            [1.0, 1.0, -1.0],
            [1.0, -1.0, -1.0],
            [-1.0, -1.0, -1.0],
            [-1.0, 1.0, -1.0],
        ],
        [ //bottom
            [-1.0, -1.0, -1.0],
            [-1.0, -1.0, 1.0],
            [1.0, -1.0, 1.0],
            [1.0, -1.0, -1.0],
        ],
    ]
        .map((x) => {
            const c = color();
            x.forEach(xx => xx.push(...c))
            return x;
        })
        .reduce((last, next) => {
            if (!last) {
                last = [];
            }
            last.push(...next)
            return last;
        })
        .reduce((last, next) => {
            if (!last) {
                last = [];
            }
            last.push(...next);
            return last;
        })
}

const initDemo = function () {
    console.log("Working");


    const canvas = document.getElementById('canvas-surface');
    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('fall back to experimental');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        console.error('FATAL: webgl is not supported');
        return;
    }


    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 50;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST)


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

    var boxVertices = coordWithColor();
    var boxIndices = [
        //top
        0, 1, 2,
        0, 2, 3,
        //left
        5, 4, 6,
        6, 4, 7,
        //right
        8, 9, 10,
        8, 10, 11,
        //front
        13, 12, 14,
        15, 14, 12,
        //back
        16, 17, 18,
        16, 18, 19,
        //bottom
        21, 20, 22,
        22, 20, 23
    ]

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW)


    var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttrLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttrLocation);


    gl.useProgram(program);


    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProjection');

    var worldMatrix = new Float32Array(4 * 4);
    var viewMatrix = new Float32Array(4 * 4);
    var projMatrix = new Float32Array(4 * 4);

    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix,
        //eye
        [0, 0, -8],
        //center
        [0, 0, 0],
        //up
        [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix,
        45 * (Math.PI / 180),
        canvas.width / canvas.height,
        0.1, 1000.0
    );

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)

    var xRotationMatrix = new Float32Array(4 * 4);
    var yRotationMatrix = new Float32Array(4 * 4);

    var identityMatrix = new Float32Array(4 * 4);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / fraction * 2 * Math.PI;

        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)


        // glMatrix.mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);

        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        // gl.drawArrays(gl.TRIANGLES, 0, boxVertices?.length);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0)
        // if (!gl.getProgramParameter(program, gl.))
        // console.log(gl.getProgramInfoLog(program));
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);




} 