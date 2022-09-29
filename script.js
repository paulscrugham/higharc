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

    compFN(a, b) {
        // return false if a is to the left of b, true otherwise.
        // return (a[0] - center[0]) * (b[1] - center[1]) - (a[1] - center[1]) * (b[0] - center[0]);
        return (a.to.x - a.from.x) * (b.to.y - b.from.y) - (a.to.y - a.from.y) * (b.to.x - b.from.x);
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    sortEdges() {
        this.edges.sort(this.compFN);

        let prev = this.edges[this.edges.length - 1];
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].next = prev;
            prev = this.edges[i];
        }
    }
}

class Edge {
    constructor(from, to) {
        this.from = from;  // Vertex
        this.to = to;  // Vertex
        this.visited = false;
        this.next = null;  // Edge
        this.pair = null;  // Edge
        from.addEdge(this);  // adds an outgoing edge to the from Vertex object
    }
}

function printVerts(v) {
    for (let i = 0; i < v.length; i++) {
        console.log("Vertex " + i + " | " + "x: " + v[i].x + ", y: " + v[i].y);
        for (let j = 0; j < v[i].edges.length; j++) {
            console.log("from: [" + v[i].edges[j].from.x + ", " + v[i].edges[j].from.y + "]" + ", " 
                + "to: [" + v[i].edges[j].to.x + ", " + v[i].edges[j].to.y + "]");
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

    // set edge pairs
    e[2*i].pair = e[2*i+1];
    e[2*i+1].pair = e[2*i];
}

// 3. sort outgoing edges for each Vertex
for (let i = 0; i < v.length; i++) {
    v[i].sortEdges();
}

console.log(e);
console.log(v);

printVerts(v);

const faces = []




// function sortCounterClockwise(verts) {
//     verts.sort(left);
// }

// // 1.   Find all neighboring vertices and sort counterclockwise
// // 1a.  Initialize neighboring vertices list
// const neighbors = [];
// for (let i = 0; i < g.vertices.length; i++) {
//     neighbors.push([]);
// }

// // 1b. Populate neighbor list
// for (let i = 0; i < g.edges.length; i++) {
//     neighbors[g.edges[i][0]].push(g.edges[i][1])
//     neighbors[g.edges[i][1]].push(g.edges[i][0])
// }
// // let center;
// // 1c. Sort each vertex list by counterclockwise order

// center = g.vertices[0];
// // console.log(center);
// neighbors[0].sort((a, b) => (a[0] - center[0]) * (b[1] - center[1]) - (a[1] - center[1]) * (b[0] - center[0]));
// console.log(neighbors[0]);

// // console.log("Neighbors sorted");
// // console.log(neighbors);

// construct Vertex objects from 