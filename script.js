console.log("Hello! This is my higharch challenge");

class Vertex {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.edges = [];
    }

    /** 
     * Computes the cross product of two points aroud a center.
     * Used in sortEdges as a comparator function to sort edges around a Vertex.
     */
    cross(b, a) {
        return (a.to.x - a.from.x) * (b.to.y - b.from.y) - (a.to.y - a.from.y) * (b.to.x - b.from.x);
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    sortEdges() {
        this.edges.sort(this.cross);

        let prev = this.edges[this.edges.length - 1];
        for (let i = 0; i < this.edges.length; i++) {
            prev.reverse.next = this.edges[i];
            prev = this.edges[i];
        }
    }

    toStr() {
        return "Vertex " + this.index;
    }
}

class Edge {
    constructor(from, to) {
        this.from = from;  // Vertex
        this.to = to;  // Vertex
        this.visited = false;
        this.next = null;  // Edge
        this.reverse = null;  // Edge
        this.face = null;
        from.addEdge(this);  // adds an outgoing edge to the from Vertex object
    }

    setFace(face) {
        this.face = face;
    }

    getFace() {
        return this.face;
    }
    
    toStr() {
        return "Edge " + this.from.index + " -> " + this.to.index;
    }
}

class Face {
    constructor(id, keyEdge) {
        this.id = id;
        this.keyEdge = keyEdge;
    }

    getVertices() {
        let verts = [this.keyEdge.from];
        let curr = this.keyEdge.next;
        while (curr != this.keyEdge) {
            verts.push(curr.from);
            curr = curr.next;
        }
        return verts;
    }

    getNeighbors() {
        let curr = this.keyEdge.next;
        const faces = [this.keyEdge.reverse.getFace().id];
        
        while (curr != this.keyEdge) {
            faces.push(curr.reverse.getFace().id);
            curr = curr.next;
        }
        return faces;
    }
}

class HEGraph {
    constructor(graph) {
        this.vertices = graph.vertices;
        this.edges = graph.edges;
        this.v = this.buildVertices(); // call function to create Vertices
        this.e = this.buildEdges(); // call function to create Edges
        this.f = this.buildFaces(); // call function to create Faces
    }

    buildVertices() {
        const v = [];
        for (let i = 0; i < this.vertices.length; i++) {
            v.push(new Vertex(this.vertices[i][0], this.vertices[i][1], i));
        }
        
        return v;
    }

    buildEdges() {
        const e = new Array(this.edges.length * 2);
        let from, to;
        for (let i = 0; i < this.edges.length; i++) {
            from = this.v[this.edges[i][0]];
            to = this.v[this.edges[i][1]];

            // create edges
            e[2*i] = new Edge(from, to);
            e[2*i+1] = new Edge(to, from);

            // set edge reverse
            e[2*i].reverse = e[2*i+1];
            e[2*i+1].reverse = e[2*i];
        }

        // sort outgoing half edges around each vert
        for (let i = 0; i < this.v.length; i++) {
            this.v[i].sortEdges();
        }
        
        return e;
    }

    buildFaces() {
        const f = [];
        let fCounter = 0;

        // this for loop could be more efficient - could skip edges that have been walked
        for (let i  = 0; i < this.e.length; i++) {
            if (this.e[i].visited == false) {
                let face = new Face(fCounter, this.e[i]);
                fCounter += 1;
                let curr = this.e[i].next;
                while (!curr.visited) {
                    curr.setFace(face);
                    curr.visited = true;
                    curr = curr.next;
                }
                f.push(face);
            }
        }

        return f;
    }

    getFaces() {
        return this.f;
    }

    getFace(id) {
        return this.f[id];
    }

    printVerts() {
        for (let i = 0; i < this.v.length; i++) {
            console.log(this.v[i].toStr());
            for (let j = 0; j < this.v[i].edges.length; j++) {
                console.log("out: " + this.v[i].edges[j].toStr() + 
                ", next: " + this.v[i].edges[j].next.toStr() + 
                ", next.next : " + this.v[i].edges[j].next.next.toStr() + 
                ", next.next.next : " + this.v[i].edges[j].next.next.next.toStr());
            }
        }
    }
}

function drawGraph(g) {
    let hegraph = new HEGraph(g);

    let svg = document.getElementById("graph");

    // clear old svg if one exists
    if (typeof(svg) != "undefined" && svg != null) {
        svg.parentNode.removeChild(svg);
    }

    // set up SVG
    let ns = "http://www.w3.org/2000/svg";
    svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");
    svg.setAttribute("id", "graph");
    svg.style.backgroundColor = "beige";
    document.body.appendChild(svg);

    let mult = 100;
    

    // add polygons
    let faces = hegraph.getFaces();
    for (let i = 0; i < faces.length; i++) {
        let polyStyle = "fill:rgb(" + 50 / faces.length * i + ", " + 255 / faces.length * i + ", " + 255 / faces.length * i + ")";
        let poly = document.createElementNS(ns, 'polygon');
        let points = "";
        let verts = faces[i].getVertices();
        for (let j = 0; j < verts.length; j++) {
            points += (verts[j].x * mult) + "," + (verts[j].y * mult) + " ";
        }
        poly.setAttribute('points', points);
        poly.setAttribute('style', polyStyle);
        svg.append(poly);
        console.log(points);
    }
}

function onClick() {
    let file = document.getElementById('graphFile');
    let g;

    if(file.files.length)
    {
        let reader = new FileReader();

        reader.onload = function(e)
        {
            document.getElementById('output').innerHTML = e.target.result;
            drawGraph(JSON.parse(e.target.result));
        };

        reader.readAsBinaryString(file.files[0]);
    }


}





