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


let g = {
    "vertices": [[0, 0], [2, 0], [2, 2], [0, 2]],
    "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]
}

let hegraph = new HEGraph(g);
console.log(hegraph.getFaces());
console.log(hegraph.getFace(2).getNeighbors());
hegraph.printVerts();