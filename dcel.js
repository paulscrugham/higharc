function max(a, b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

function min(a, b) {
    if (a < b) {
        return a;
    } else {
        return b;
    }
}

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

        // chain half edges around each vertex
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
        this.face = null;  // Face
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
        let curr = this.keyEdge;
        const faces = [];
        
        do {
            if (curr.reverse) {
                faces.push(curr.reverse.getFace().id);
            }
            curr = curr.next;
        } while (curr != this.keyEdge);
        
        return faces;
    }
}

class HEGraph {
    constructor(graph) {
        this.vertices = graph.vertices;
        this.edges = [null].concat(graph.edges);
        this.xMax = this.vertices[0][0];
        this.yMax = this.vertices[0][1];
        this.xMin = this.xMax;
        this.yMin = this.yMax;
        this.v = this.buildVertices(); // call function to create Vertices
        this.e = this.buildEdges(); // call function to create Edges
        this.f = this.buildFaces(); // call function to create Faces
        this.keyVert;  // pointer to Vertex

    }

    buildVertices() {
        const v = [];
        let i = 0;
        let keyVertId = this.vertices;
        // build vertices
        for (i = 0; i < this.vertices.length; i++) {
            let newVert = new Vertex(this.vertices[i][0], this.vertices[i][1], i);
            v.push(newVert);
            
            if (this.vertices[i][1] > this.yMax) {
                keyVertId = i;
                this.yMax = this.vertices[i][1];
            }

            this.xMax = max(this.xMax, this.vertices[i][0]);
            this.xMin = min(this.xMin, this.vertices[i][0]);
            this.yMin = min(this.yMin, this.vertices[i][1]);

        }
        // create a key Vertex at the bottom right of the graph
        this.keyVert = new Vertex(this.vertices[keyVertId][0] + 1, this.vertices[keyVertId][1] + 1, i);
        v.push(this.keyVert);
        this.edges[0] = [keyVertId, i];
        // console.log(this.xMax, this.yMax, this.xMin, this.yMin);
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
        let extFace;

        // this for loop could be more efficient - could skip edges that have been walked
        for (let i = 0; i < this.e.length; i++) {
            if (this.e[i].visited == false) {
                let face = new Face(fCounter, this.e[i]);
                
                let curr = this.e[i].next;
                while (!curr.visited) {
                    curr.setFace(face);
                    curr.visited = true;
                    curr = curr.next;
                }
                
                if (i > 1) {
                    // add face if interior
                    fCounter += 1;
                    f.push(face);
                } else {
                    extFace = face;
                }
            }
        }

        // iterate over the exterior face and remove interior face references to itself
        let curr = extFace.keyEdge.next.next;
        while (curr != extFace.keyEdge) {
            curr.reverse.reverse = null;
            curr = curr.next;
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

    /**
     * Computes "layers" of neighboring face sets from a starting face.
     */
    computeLayers(faceId) {
        const layers = [[faceId]];
        const found = new Array(this.f.length).fill(false);
        found[faceId] = true;
        let countFound = 1;

        // iterate until all faces have been found
        while (countFound < this.f.length) {
            const currLayer = [];
            // iterate over each face in the last layer of faces
            for (let i = 0; i < layers[layers.length - 1].length; i++) {
                let neighbors = userGraph.getFace(layers[layers.length - 1][i]).getNeighbors();
                // iterate over the neighbor of each face and determine if it has been found
                for (let j = 0; j < neighbors.length; j++) {
                    if (!found[neighbors[j]]) {
                        currLayer.push(neighbors[j]);
                        found[neighbors[j]] = true;
                        countFound++;
                    }
                }
            }
            layers.push(currLayer);
        }
        return layers;
    }
}