function algo2tests() {
    let g = {
        "vertices": [[0.5, 0.5], [3, 0], [1, 4], [0, 2], [4, 2], [4, 5]],
        "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3], [1, 4], [4, 2], [4, 5], [5, 2]]
    }
    
    let hegraph = new HEGraph(g);
    let face = hegraph.getFace(0);
    let neighbors = face.getNeighbors();
    
    console.log(neighbors);

    g = {                                        
        "vertices": [[0, 0], [2, 0], [2, 2], [0, 2]],        
        "edges": [[0, 1], [1, 2], [0, 2], [0, 3], [2, 3]]    
    }

    hegraph = new HEGraph(g);
    face = hegraph.getFace(0);
    neighbors = face.getNeighbors();
    
    console.log(neighbors);
}

