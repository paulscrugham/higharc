let userGraph;  // global variable to store current graph
let layers;  // global variable to store current layer set for iterating
const ns = "http://www.w3.org/2000/svg";

const SVGPAD = 20;
const SVGDIM_X = document.getElementById("svgGraph").getAttribute('width') - SVGPAD * 2;
const SVGDIM_Y = document.getElementById("svgGraph").getAttribute('height') - SVGPAD * 2;

/**
 * Calculates the scale factor to fit the graph to the SVG canvas.
 */
function getGraphScale(g) {
    if (g.xMax - g.xMin >= g.yMax - g.yMin) {
        return SVGDIM_X / (g.xMax - g.xMin);
    } else {
        return SVGDIM_Y / (g.yMax - g.yMin);
    }
}

/**
 * Finds which face the point is inside of for algorithm 3 and 
 * highlights the SVG polygon.
 */
function findFace(x, y) {
    // draw point
    let svg = document.getElementById('svgGraph');

    eraseElement('svgFindFace');  // clear any existing layer svg

    // create group for point and face
    group = document.createElementNS(ns, 'g');
    group.setAttribute('id', 'svgFindFace');
    let scale = getGraphScale(userGraph);

    let circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', (x - userGraph.xMin) * scale + SVGPAD);
    circle.setAttribute('cy', (y - userGraph.yMin) * scale + SVGPAD);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', 'red');

    let faceId = userGraph.pointInGraph([x, y]);

    if (faceId != null) {
        let svgFace = document.createElementNS(ns, 'use');
        svgFace.setAttribute('href', '#' + faceId);
        svgFace.setAttribute('fill', 'None');
        svgFace.setAttribute('stroke', 'red');
        svgFace.setAttribute('stroke-width', '3');
        group.append(svgFace);
        document.getElementById('a3Output').innerHTML = faceId;
    } else {
        document.getElementById('a3Output').innerHTML = "None";
    }
    group.append(circle);
    svg.append(group);
    
}

/**
 * Computes the layers for algorithm 4.
 */
function computeLayers(faceId) {
    layers = userGraph.computeLayers(faceId);
    // update slider length
    let slider = document.getElementById('faceLayersNumber');
    slider.setAttribute('max', layers.length - 1);
}

/** 
 * Draws the SVG layers for algorithm 4.
*/
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
        // svgFace.append("text")
        //     .attr('text-anchor', 'middle')
        //     .attr('fill', 'red')
        //     .text(i);
        group.append(svgFace);
    }
    svg.append(group);
    document.getElementById('a4Output').innerHTML = layers[layerId];
}

/**
 * Draws neighboring SVG faces for algorithm 2.
 */
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
    document.getElementById('a2Output1').innerHTML = faceId;
    document.getElementById('a2Output2').innerHTML = neighborFaceIds;
}

/**
 * Used to clear the SVG graph of the specified element.
 */
function eraseElement(elementId) {
    let group = document.getElementById(elementId);
    if (typeof(group) != "undefined" && group != null) {
        group.parentNode.removeChild(group);
    }
}

/**
 * Given input graph data, builds a DCEL object and draws the interior faces as SVG.
 */
function drawGraph(g) {
    let hegraph = new HEGraph(g);
    let svg = document.getElementById("svgGraph");

    eraseElement('svgFaceGroup');  // clear any existing face svg elements

    group = document.createElementNS(ns, 'g');
    group.setAttribute('id', 'svgFaceGroup');

    // calculate scale factor
    let scale = getGraphScale(hegraph);

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

    document.getElementById('a1Output').innerHTML = hegraph.getFaceCount();
}

/**
 * Used to load a JSON file and call drawGraph().
 */
function onClick() {
    let file = document.getElementById('graphFile');

    if(file.files.length)
    {
        let reader = new FileReader();

        reader.onload = function(e)
        {
            drawGraph(JSON.parse(e.target.result));  // constructs an HEGraph object and draws an SVG
        };

        reader.readAsBinaryString(file.files[0]);
    }
}





