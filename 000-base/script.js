var initDemo = function () {
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



}