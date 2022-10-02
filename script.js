console.log("Hello! This is my higharch challenge");

let userGraph;
let layers;
let ns = "http://www.w3.org/2000/svg";
let mult = 100;

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
        let face = userGraph.getFace(layers[layerId][i]);
        let svgFace = createSVGPoly(face);
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

    // get specified face id
    // let faceId = document.getElementById("faceNeighbor").value;
    
    // get all neighboring face ids and draw new polygons
    let neighborFaceIds = userGraph.getFace(faceId).getNeighbors();
    // set slider length to number of faces
    let slider = document.getElementById('faceNeighbor');
    slider.setAttribute('max', userGraph.getFaces().length - 1);
    
    for (let i = 0; i < neighborFaceIds.length; i++) {
        let svgFace = createSVGPoly(userGraph.getFace(neighborFaceIds[i]));
        svgFace.setAttribute('fill', 'None');
        svgFace.setAttribute('stroke', 'red');
        svgFace.setAttribute('stroke-width', '3');
        group.append(svgFace);
    }
    let svgFace = createSVGPoly(userGraph.getFace(faceId));
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

function createSVGPoly(face) {
    let poly = document.createElementNS(ns, 'polygon');
    let points = "";
    let verts = face.getVertices();
    for (let j = 0; j < verts.length; j++) {
        points += (verts[j].x * mult) + "," + (verts[j].y * mult) + " ";
    }
    poly.setAttribute('points', points);
    return poly;
}

function drawGraph(g) {
    let hegraph = new HEGraph(g);
    userGraph = hegraph;

    let svg = document.getElementById("svgGraph");

    // clear old svg if one exists
    if (typeof(svg) != "undefined" && svg != null) {
        svg.parentNode.removeChild(svg);
    }

    // set up SVG
    svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");
    svg.setAttribute("id", "svgGraph");
    svg.style.backgroundColor = "beige";
    document.body.appendChild(svg);

    // add polygons
    let faces = hegraph.getFaces();
    for (let i = 0; i < faces.length; i++) {
        let polyStyle = "fill:rgb(" + 50 / faces.length * i + ", " + 255 / faces.length * i + ", " + 255 / faces.length * i + ")";
        let poly = createSVGPoly(faces[i]);
        poly.setAttribute('style', polyStyle);
        poly.setAttribute('id', i);
        svg.append(poly);
        // console.log(points);
    }
    // console.log(userGraph.getFaces());
}

function onClick() {
    let file = document.getElementById('graphFile');

    if(file.files.length)
    {
        let reader = new FileReader();

        reader.onload = function(e)
        {
            document.getElementById('output').innerHTML = e.target.result;
            drawGraph(JSON.parse(e.target.result));  // constructs an HEGraph object and draws an SVG
        };

        reader.readAsBinaryString(file.files[0]);
    }
}





