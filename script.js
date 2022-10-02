// TODO: replace group removal with child removal

console.log("Hello! This is my higharch challenge");

let userGraph;
let layers;
const ns = "http://www.w3.org/2000/svg";
const mult = 100;

const SVGPAD = 20;
const SVGDIM_X = document.getElementById("svgGraph").getAttribute('width') - SVGPAD * 2;
const SVGDIM_Y = document.getElementById("svgGraph").getAttribute('height') - SVGPAD * 2;

function computeLayers(faceId) {
    layers = userGraph.computeLayers(faceId);
    // update slider length
    let slider = document.getElementById('faceLayersNumber');
    slider.setAttribute('max', layers.length - 1);
}

function drawLayers(layerId) {
    // get existing svg graph
    let svg = document.getElementById('svgGraph');

    eraseElement('svgLayerGroup');  // clear any existing layer svg

    // create group for neighbor faces
    group = document.createElementNS(ns, 'g');
    group.setAttribute('id', 'svgLayerGroup');

    // draw layer
    for (let i = 0; i < layers[layerId].length; i++) {
        // let face = userGraph.getFace(layers[layerId][i]);
        // let svgFace = createSVGPoly(face);
        let svgFace = document.createElementNS(ns, 'use');
        svgFace.setAttribute('href', '#' + layers[layerId][i]);
        svgFace.setAttribute('fill', 'None');
        svgFace.setAttribute('stroke', 'red');
        svgFace.setAttribute('stroke-width', '3');
        group.append(svgFace);
    }
    svg.append(group);
}

function drawNeighbors(faceId) {
    // get existing svg graph
    let svg = document.getElementById('svgGraph');

    eraseElement('svgNeighborGroup');  // clear any existing neighbor svg

    group = document.createElementNS(ns, 'g');
    group.setAttribute('id', 'svgNeighborGroup');
    
    // get all neighboring face ids and draw new polygons
    let neighborFaceIds = userGraph.getFace(faceId).getNeighbors();
    // set slider length to number of faces
    let slider = document.getElementById('faceNeighbor');
    slider.setAttribute('max', userGraph.getFaces().length - 1);
    
    for (let i = 0; i < neighborFaceIds.length; i++) {
        // let svgFace = createSVGPoly(userGraph.getFace(neighborFaceIds[i]));
        let svgFace = document.createElementNS(ns, 'use');
        svgFace.setAttribute('href', '#' + neighborFaceIds[i]);
        svgFace.setAttribute('fill', 'None');
        svgFace.setAttribute('stroke', 'red');
        svgFace.setAttribute('stroke-width', '3');
        group.append(svgFace);
    }
    // let svgFace = createSVGPoly(userGraph.getFace(faceId));
    let svgFace = document.createElementNS(ns, 'use');
    svgFace.setAttribute('href', '#' + faceId);
    svgFace.setAttribute('fill', 'None');
    svgFace.setAttribute('stroke', 'purple');
    svgFace.setAttribute('stroke-width', '3');
    group.append(svgFace);

    svg.append(group);
}

function eraseElement(elementId) {
    let group = document.getElementById(elementId);
    if (typeof(group) != "undefined" && group != null) {
        group.parentNode.removeChild(group);
    }
}

function drawGraph(g) {
    let hegraph = new HEGraph(g);
    let svg = document.getElementById("svgGraph");

    eraseElement('svgFaceGroup');  // clear any existing face svg elements

    group = document.createElementNS(ns, 'g');
    group.setAttribute('id', 'svgFaceGroup');

    // calculate scale factor
    let scale;
    if (hegraph.xMax - hegraph.xMin >= hegraph.yMax - hegraph.yMin) {
        scale = SVGDIM_X / (hegraph.xMax - hegraph.xMin);
    } else {
        scale = SVGDIM_Y / (hegraph.yMax - hegraph.yMin);
    }

    // add polygons
    let faces = hegraph.getFaces();
    for (let i = 0; i < faces.length; i++) {
        let polyStyle = "fill:rgb(" + 50 / faces.length * i + ", " + 255 / faces.length * i + ", " + 255 / faces.length * i + ")";
        let poly = document.createElementNS(ns, 'polygon');
        let points = "";
        let verts = faces[i].getVertices();
        for (let j = 0; j < verts.length; j++) {
            points += ((verts[j].x - hegraph.xMin) * scale + SVGPAD) + "," + ((verts[j].y - hegraph.yMin) * scale + SVGPAD) + " ";
        }
        poly.setAttribute('points', points);
        poly.setAttribute('style', polyStyle);
        poly.setAttribute('id', i);
        group.append(poly);
    }
    svg.append(group);
    userGraph = hegraph;
}

function onClick() {
    let file = document.getElementById('graphFile');

    if(file.files.length)
    {
        let reader = new FileReader();

        reader.onload = function(e)
        {
            // document.getElementById('output').innerHTML = e.target.result;
            drawGraph(JSON.parse(e.target.result));  // constructs an HEGraph object and draws an SVG
        };

        reader.readAsBinaryString(file.files[0]);
    }
}





