console.log("Hello! This is my higharch challenge");


let g = {
    "vertices": [[0, 0], [2, 0], [2, 2], [0, 2]],
    "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]
}


class Vertex {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.edges = [];  // Edges
    }

    compFN(b, a) {
        return (a.to.x - a.from.x) * (b.to.y - b.from.y) - (a.to.y - a.from.y) * (b.to.x - b.from.x);
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    sortEdges() {
        this.edges.sort(this.compFN);

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

function printVerts(v) {
    for (let i = 0; i < v.length; i++) {
        console.log(v[i].toStr());
        for (let j = 0; j < v[i].edges.length; j++) {
            console.log("out: " + v[i].edges[j].toStr() + 
            ", next: " + v[i].edges[j].next.toStr() + 
            ", next.next : " + v[i].edges[j].next.next.toStr() + 
            ", next.next.next : " + v[i].edges[j].next.next.next.toStr());
        }
    }
}


// 1. create Vertex objects
const v = [];

for (let i = 0; i < g.vertices.length; i++) {
    v.push(new Vertex(g.vertices[i][0], g.vertices[i][1], i));
}

// 2. create Edge objects
const e = new Array(g.edges.length * 2);

let from, to;
for (let i = 0; i < g.edges.length; i++) {
    from = v[g.edges[i][0]];
    to = v[g.edges[i][1]];

    // create edges
    e[2*i] = new Edge(from, to);
    e[2*i+1] = new Edge(to, from);

    // set edge reverse
    e[2*i].reverse = e[2*i+1];
    e[2*i+1].reverse = e[2*i];
}

// 3. sort outgoing edges for each Vertex
for (let i = 0; i < v.length; i++) {
    v[i].sortEdges();
}

// 4. traverse half edges and build faces
const f = [];
let fCounter = 0;

// this for loop could be more efficient - could skip edges that have been walked
for (let i  = 0; i < e.length; i++) {
    if (e[i].visited == false) {
        let face = new Face(fCounter, e[i]);
        fCounter += 1;
        let curr = e[i].next;
        while (!curr.visited) {
            curr.setFace(face);
            curr.visited = true;
            curr = curr.next;
        }
        f.push(face);
    }
}

for (let i = 0; i < f.length; i++) {
    console.log(f[i].getVertices());
}

for (let i = 0; i < f.length; i++) {
    console.log("Face " + f[i].id + ": " + f[i].getNeighbors());
}
