function a1_test(desc, graph, expected) {
    let hegraph = new HEGraph(graph);
    console.log(desc);
    console.log("   Input:", graph);
    console.log("   Expected:", expected);
    console.log("   Actual:", hegraph.getFaceIds());
    console.log("   Face Objects:", hegraph.getFaces());
    console.log();
}

function algorithm1_tests() {
    console.log("---Algorithm 1 Tests---")
    // test 1
    let desc = "TEST 1 - A simple test that draws two faces from four vertices and returns the face identifiers";
    let graph2 = {                                        
        "vertices": [[0, 0], [2, 0], [2, 2], [0, 2]],        
        "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]    
    };
    let expected = [0, 1];
    a1_test(desc, graph2, expected);

    // test 2
    desc = "TEST 2 - A test that draws four triangular faces where five edges converge on one point";
    let graph1 = {
        "vertices": [[0.5, 0.5], [3, 0], [1, 4], [0, 2], [4, 2], [4, 5]],
        "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3], [1, 4], [4, 2], [4, 5], [5, 2]]
    };
    expected = [0, 1, 2, 3];
    a1_test(desc, graph1, expected);

    // test 3
    desc = "TEST 3 - Tests a graph where edges are drawn out of order";
    let graph3 = {
        "vertices": [[1, 1], [2, 1], [2, 2], [1, 2], [0, 0], [3, 0], [3, 3], [0, 3]],        
        "edges": [[3, 0], [0, 1], [1, 2], [2, 3], [5, 6], [6, 7], [7, 4], [4, 5], [4, 0], [5, 1], [6, 2], [7, 3]]    
    };
    expected = [0, 1, 2, 3, 4];
    a1_test(desc, graph3, expected);

    // test 4
    desc = "TEST 4 - Tests a graph where vertices may have both parallel and non-parallel outgoing edges. This was a bug in my original vertex sorting function.";
    let graph6 = {
        "vertices": [[0, 0], [4, 0], [8, 0], [11, -1], [-1, 4], [4, 3], [8, 3], [11, 3], [0, 7], [3, 8], [8, 8], [12, 8], [0, 12], [4, 11], [7, 11], [12, 12]], 
        "edges": [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [8, 9], [9, 10], [10, 11], [12, 13], [13, 14], [14, 15], [0, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 9], [6, 10], [7, 11], [8, 12], [9, 13], [10, 14], [11, 15]]
    };
    expected = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    a1_test(desc, graph6, expected);

    // test 5
    desc = "TEST 5 - Tests a graph containing a concave face";
    let graph11 = {
        "vertices": [[0, 0], [4, 0], [2, 1], [5, 2], [1, 3], [3, 3], [3, 4], [0, 4]],
        "edges": [[0, 1], [0, 2], [1, 2], [1, 3], [3, 2], [2, 4], [4, 5], [5, 6], [6, 7], [7, 0]]
    };
    expected = [0, 1, 2];
    a1_test(desc, graph11, expected);
}