function a4_test(desc, faceId, graph, expectedLayerCount, expectedLayers) {
    let hegraph = new HEGraph(graph);
    let layers = hegraph.computeLayers(faceId);
    let expectedFaceCount = 0;
    let actualFaceCount = 0;
    console.log(desc);
    console.log("   Input face id:", faceId);
    console.log("   Expected number of layers:", expectedLayerCount);
    console.log("   Actual number of layers:", layers.length);
    console.log("   Expected layers:");
    for (let i = 0; i < expectedLayerCount; i++) {
        console.log("      ", expectedLayers[i]);
        expectedFaceCount += expectedLayers[i].length;
    }
    console.log("   Actual layers:");
    for (let i = 0; i < layers.length; i++) {
        console.log("      ", layers[i]);
        actualFaceCount += layers[i].length;
    };
    console.log("   Expected total face count:", expectedFaceCount);
    console.log("   Actual total face count:", actualFaceCount);
    console.log();
}

function algorithm4_tests() {
    console.log("---Algorithm 4 Tests---");
    // test 1
    let desc = "TEST 1 - Tests a graph containing faces that touch only on their vertices that shouldn't be included as face neighbors";
    let faceId = 0;
    let graph4 = {                                        
        "vertices": [[0, 0], [2, 0.5], [4, 0], [3.5, 2], [4, 4], [2, 3.5], [0, 4], [0.5, 2], [2, 1], [3, 2], [2, 3], [1, 2]],        
        "edges": [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [4, 5], [6, 7], [7, 0], [0, 8], [8, 2], [2, 9], [9, 4], [4, 10], [10, 6], [6, 11], [11, 0], [8, 9], [9, 10], [10, 11], [11, 8]]    
    };
    let expectedLayerCount = 5;
    let expectedLayers = [[0], [5,4], [1,8,3], [6,7], [2]];
    a4_test(desc, faceId, graph4, expectedLayerCount, expectedLayers);

    // test 2
    desc = "TEST 2 - Tests the same graph as the previous test, but starting from the center";
    faceId = 8;
    expectedLayerCount = 3;
    expectedLayers = [[8], [5,6,7,4], [0,1,2,3]];
    a4_test(desc, faceId, graph4, expectedLayerCount, expectedLayers);

    // test 3
    desc = "TEST 3 - Tests a graph with a concave face where each face has a single neighbor";
    faceId = 1;
    graph11 = {
        "vertices": [[0, 0], [4, 0], [2, 1], [5, 2], [1, 3], [3, 3], [3, 4], [0, 4]],
        "edges": [[0, 1], [0, 2], [1, 2], [1, 3], [3, 2], [2, 4], [4, 5], [5, 6], [6, 7], [7, 0]]
    };
    expectedLayerCount = 3;
    expectedLayers = [[1], [0], [2]];
    a4_test(desc, faceId, graph11, expectedLayerCount, expectedLayers);

    

}