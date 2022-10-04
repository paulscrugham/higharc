/*
My solution to the challenge of finding all interior faces of a graph involves building a doubly connected
edge list (DCEL) or half edge data structure.

This is implemented through four classes: Vertex, Edge, Face, and HEGraph.
- the Vertex class represents a point in the graph and stores:
    - its x,y coordinates
    - an identifier
    - a list of pointers to outgoing Edges.
- the Edge class represents a half edge in the graph and stores:
    - pointers to its from and to Vertex objects
    - a boolean value track whether the Edge was visited when building Faces
    - a pointer to the next Edge
    - a pointer to the reverse/pair Edge
    - the identifier of the Edge's associated Face
- the Face class represents an interior Face in the graph and stores:
    - a unique identifier (also the index of the Face in the HEGraph's face list)
    - a pointer to the Face's key Edge (any edge within the Face)
- the HEGraph class represents the graph and stores:
    - the input vertex and edge data
    - min and max values that represent a bounding box of the graph (for drawing the SVG)
    - lists of pointers to Vertex, Edge, and Face objects
    - a pointer to an extra Vertex used to build and delete the exterior face

The code below contains a more detailed description of my solution's computational complexity, but here is an overview:
- v: number of input vertices
- e: number of input edges
- V: number of Vertex objects created
- E: number of Edge objects created
- F: number of Face objects created

Algorithm 1 - find interior faces:
    1. Build Vertex objects from input vertices - O(v)
    2. Build Edge objects from input edges and associate with their origin Vertex - O(e*2)
    3. Sort outgoing edges at each Vertex in counterclockwise order, then chain edges - O(V)
    4. Iterate over the graph's list of Edges and build Faces - O(E)
    Total time/space complexity = O(v + e*2 + V + E)
Algorithm 2 - find a face's neighbors:
    1. Using the Face's identifier, index the Face in the graph's list of Faces - O(1)
    2. Iterate over the Face's Edges and collect the associated Face identifiers - O(1)
    Total time/space complexity = O(1)
Algorithm 3 - find the face that a point lies within
    1. Iterate over each Edge in each Face to build a bounding box - O(E)
    2. Iterate over each Edge in each Face to check for intersections - O(E)
    Total time complexity = O(E) in the best case, O(E*2) in the worst case
    Total space complexity = O(1)
Algorithm 4 - find layers from starting Face:
    1. Get the Face object in question by indexing its unique identifier and create first layer - O(1)
    2. Iterate over Face Edges in the previous layer and add neighbors if they are unvisited - O(E) for entire graph
        2a. Checking for or marking a visited Face - time: O(1), space: O(F)
    Total time complexity = O(E)
    Total space complexity = O(F)
*/

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
     * Note: this comparison function does not handle overlapping edges since it is
     * assumed that such edges would be separated by a vertex.
     * Runs in O(1) time.
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

    /**
     * Sorts the Edge list of a Vertex object in counterclockwise order.
     * Uses the Javascript sort method, which is typically O(E'logE') if
     * E' is the number of outgoing Edges at a Vertex.
     */
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

    /**
     * Iterates over the Edges of a Face and returns a list of Vertex 
     * objects that make up this Face.
     * Because the average degree of a face in a planar graph is bounded,
     * this operation can be considered to run in O(1) (though it may be closer to
     * O(E) for a graph with many edges and few faces).
     */
    getVertices() {
        let verts = [this.keyEdge.from];
        let curr = this.keyEdge.next;
        while (curr != this.keyEdge) {
            verts.push(curr.from);
            curr = curr.next;
        }
        return verts;
    }

    /**
     * Iterates over the Edges of a Face and returns the identifiers
     * for each neighboring face in an array.
     * Because the average degree of a face in a planar graph is bounded,
     * this operation can be considered to run in O(1) time (though it may be closer to
     * O(E) for a graph with many edges and few faces).
     */
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

    /**
     * Constructs Vertex objects, determines the graph's overall dimensional bounds,
     * and creates a key vertex and edge for removing the exterior face later on.
     * If v is the number of input vertices and E' is the number of outgoing Edges 
     * at each vertex, this operation runs in O(v * E'logE'). Since the average degree 
     * of a vertex in a planar graph is bounded, the edge sorting time can be considered 
     * a constant time operation making the overall time complexity simply O(v). Uses O(v) space.
     */
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

    /**
     * Constructs Edge objects, links them to their origin Vertex objects, and 
     * sorts each Vertex's edge list.
     * Creating the Edge objects takes O(e*2) space and O(e) time if e is the number of input edges.
     * Sorting the Vertex edge lists takes O(V) time because the average degree of a vertex
     * in a planar graph is bounded. Thus the O(nlogn) complexity of the sort for each Vertex
     * usually has no affect on the overall time complexity.
     */
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

    /**
     * Constructs Face objects and stores them in an array.
     * If E is the number of Edge objects, this operation takes O(E*2) time and uses O(E) space.
     * This takes about O(E*2) time because most Edge objects will be visited twice: once in the outer for loop
     * and once in the inner while loop.
     */
    buildFaces() {
        const f = [];
        let fCounter = 0;
        let extFace;

        // iterate over edges and build faces
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
        // this can be considered to be done in O(1) time typically since average face size is bounded
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

    /**
     * Returns a list of all face identifiers in O(F) time. Face object identifiers match their index
     * in the faces list, so determining a face's position or the number of faces can simply be done in O(1)
     * time.
     */
    getFaceIds() {
        const ids = [];
        for (let i = 0; i < this.f.length; i++) {
            ids.push(this.f[i].id);
        }
        return ids;
    }

    /**
     * Returns a Face object from its identifier.
     * This operation runs in O(1) time.
     */
    getFace(id) {
        return this.f[id];
    }

    getFaceCount() {
        return this.f.length;
    }

    /**
     * Computes "layers" of neighboring face sets from a starting face.
     * This operation takes O(E) time since it iterates over every Edge and uses O(F) space to store the
     * layers of faceIds. Checking if a Face has been visited only takes O(1) time to look up an
     * index in the "found" boolean array.
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
                let neighbors = this.getFace(layers[layers.length - 1][i]).getNeighbors();
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

    /**
     * Determines whether a point [x, y] lies within a specified face. Returns true if so, 
     * and false otherwise. First the algorithm performs a fast check if the point lies in a bounding
     * box. If inside the bounding box, it uses ray tracing to check how many times a horizontal ray 
     * intersects the Face's edges. The bounding box check is done in O(E') time if E' is the number
     * of edges in a Face. The ray tracing check is done in O(E') time as well since the intersection
     * calculation is performed for each edge. In the worst case this operation takes O(E'*2 time) to
     * perform the bounding box and intersection checks, and in the best case O(E') time for the bounding
     * box check.
     * NOTE: if the point lies directly on a graph edge or vertice, behavior is unpredictable.
     */
    pointInFace(faceId, point) {
        let face = this.getFace(faceId);
        let edges = [];
        let curr = face.keyEdge;
        // initialize bBox values
        let minX = curr.from.x;
        let minY = curr.from.y;
        let maxX = minX;
        let maxY = minY;
        
        // get Edges and track min/max values for bounding box
        do {
            edges.push(curr);
            curr = curr.next;
            // update bBox values
            minX = min(minX, curr.from.x);
            minY = min(minY, curr.from.y);
            maxX = max(maxX, curr.from.x);
            maxY = max(maxY, curr.from.y);
        } while (curr != face.keyEdge);

        let x = point[0];
        let y = point[1];

        // check if point lies outside face bounding box
        if (minX > x || x > maxX || minY > y || maxY < y)
            return false;

        // check if point intersects 
        let odd = false;
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

    /**
     * Algorithm 3
     * Determines whether a point [x, y] lies within any face in the graph. Returns
     * the face identifier if so, and null if not. This operation takes O(E) time in the best 
     * case (only bounding boxes are checked so iterate over each Edge once) and O(E*2) in 
     * the worst case (bounding boxes and edge intersections are checked so iterate twice over
     * each Edge).
     * NOTE: if the point lies directly on a graph edge or vertice, behavior is unpredictable.
     */
    pointInGraph(point) {
        let found = false;
        let i = 0;

        while (!found && i < this.f.length) {
            found = this.pointInFace(i, point);
            i++;
        }

        if (found) {
            return i - 1;
        } else {
            return null;
        }
    }
}