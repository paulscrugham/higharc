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
     * Determines the counterclockwise order of the edges a and b.
     * Used in sortEdges as a comparator function to sort edges around a Vertex.
     * Returns a positive number if a is to the left of b, negative otherwise.
     * Note: this comparison function does not handle parallel coincident edges since it is
     * assumed that such edges would be separated by a vertex.
     */
    cross(a, b) {
        // A. case where point a is right of center and b is left of center
        if (a.to.x - a.from.x >= 0 && b.to.x - b.from.x < 0)
            return -1;
        // B. case where point a is left of center and b is right of center
        if (a.to.x - a.from.x < 0 && b.to.x - b.from.x >= 0)
            return 1;
        if (a.to.x - a.from.x == 0 && b.to.x - b.from.x == 0) {
            // C. case where a is directly above b (edges are parallel)
            if (a.to.y - a.from.y >= 0 && b.to.y - b.from.y < 0)
                return -1;
            // D. case where b is directly above a (edges are parallel)
            if (a.to.y - a.from.y < 0 && b.to.y - b.from.y >= 0)
                return 1;
        }
        // E. case where a and b are in the same quadrant and cross product can be computed
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
        return v;
    }

    buildEdges() {
        const e = [];
        let from, to;
        for (let i = 0; i < this.edges.length; i++) {
            from = this.v[this.edges[i][0]];
            to = this.v[this.edges[i][1]];

            // create edges
            let left = new Edge(from, to);
            let right = new Edge(to, from);
            // set edge reverse
            left.reverse = right;
            right.reverse = left;

            e.push(left);
            e.push(right);
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

    pointInFace(faceId, point) {
        let face = this.getFace(faceId);
        let edges = [];
        let curr = face.keyEdge;
        do {
            edges.push(curr);
            curr = curr.next;
        } while (curr != face.keyEdge);

        // TODO: check bounding box first
        let odd = false;
        let x = point[0];
        let y = point[1];
        
        for (let i = 0; i < edges.length; i++) {
            let a = edges[i].from;
            let b = edges[i].to;
            // check if a.y is above y and b.y is below y and vice versa (horizontal ray intersects edge)
            if (a.y < y && b.y >= y || b.y < y && a.y >= y) {
                // compute x value of intersection point
                let xIntersect = a.x + (y - a.y) / (b.y - a.y) * (b.x - a.x);
                // check if x value is to the left of x
                if (xIntersect < x) {
                    odd = !odd;
                }
            }
        }
        return odd; 
    }
}