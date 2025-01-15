function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

// Heuristic for A*
function heuristic(a, b) {
  return dist(a.i, a.j, b.i, b.j);
}

var cols = 50;
var rows = 50;
var grid = new Array(cols);
var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];
var startSet = false;
var endSet = false;
var algorithmSelected = false;
var currentAlgorithm = "astar";
var current;
var startTime, endTime;

function setup() {
  createCanvas(800, 800);
  w = width / cols;
  h = height / rows;

  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  background(45, 197, 244);
}

function mousePressed() {
  let i = floor(mouseX / w);
  let j = floor(mouseY / h);

  if (i >= 0 && i < cols && j >= 0 && j < rows) {
    let spot = grid[i][j];

    if (!startSet && !spot.wall) {
      start = spot;
      startSet = true;
      openSet.push(start);
      console.log("Start point set at: ", i, j);
    } else if (!endSet && !spot.wall) {
      end = spot;
      endSet = true;
      console.log("End point set at: ", i, j);

      algorithmSelected = true;
      startTime = millis();

      // resetPathfinding();
    }
  }
}

function resetPathfinding() {
  openSet = [];
  closedSet = [];
  path = [];
  startSet = false;
  endSet = false;
  algorithmSelected = false;
  current = undefined;
  loop(); // Restart draw loop
}

function draw() {
  if (algorithmSelected) {
    if (currentAlgorithm === "astar") {
      astar();
    } else if (currentAlgorithm === "dfs") {
      dfs();
    } else if (currentAlgorithm === "bfs") {
      bfs();
    } else if (currentAlgorithm === "dStarLite") {
      modifyGrid();
      dStarLite();
    } else if (currentAlgorithm === "dStar") {
      modifyGrid();
      dStar();
    }
  }

  background(45, 197, 244, 1);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }

  if (startSet) {
    start.show(color(0, 255, 0)); // Start point (green)
  }
  if (endSet) {
    end.show(color(255, 0, 0)); // End point (red)
  }

  // Only construct the path if the end has been reached
  if (startSet && endSet && current !== undefined) {
    path = [];
    let temp = current;
    while (temp !== undefined) {
      path.push(temp);
      temp = temp.previous; // Safely access previous
    }

    noFill();
    stroke(252, 238, 33);
    strokeWeight(w / 2);
    beginShape();
    for (var i = 0; i < path.length; i++) {
      vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
  }
}

function astar() {
  if (openSet.length > 0) {
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    current = openSet[winner];

    if (current === end) {
      noLoop();
      console.log("A* Algorithm DONE!");
      endTime = millis();

      // Calculate and display the total distance
      const totalDistance = calculateTotalDistance(path);
      document.getElementById("totalDistance").innerHTML =
        "Total Distance: " + totalDistance.toFixed(2);

      document.getElementById("timeTaken").innerHTML =
        "Time taken: " + (endTime - startTime) + " ms";
      setTimeout(resetPathfinding, 2000);
      resetPathfinding();
      return;
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        var tempG = current.g + heuristic(neighbor, current);

        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  } else {
    console.log("no solution");
    noLoop();
    return;
  }
}

function selectAlgorithm() {
  const select = document.getElementById("algorithmSelect");
  currentAlgorithm = select.value;

  // Reset the pathfinding state when switching algorithms
  resetPathfinding();

  console.log(currentAlgorithm + " Algorithm Selected");
}

function dfs() {
  if (openSet.length > 0) {
    current = openSet.pop();
    closedSet.push(current);

    if (current === end) {
      noLoop();
      console.log("DFS Algorithm DONE!");
      endTime = millis();

      // Calculate and display the total distance
      const totalDistance = calculateTotalDistance(path);
      document.getElementById("totalDistance").innerHTML =
        "Total Distance: " + totalDistance.toFixed(2);

      document.getElementById("timeTaken").innerHTML =
        "Time taken: " + (endTime - startTime) + " ms";
      setTimeout(resetPathfinding, 2000);
      resetPathfinding();
      return;
    }

    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        neighbor.previous = current;
        openSet.push(neighbor);
      }
    }
  } else {
    console.log("no solution");
    noLoop();
    return;
  }
}

function bfs() {
  if (openSet.length > 0) {
    current = openSet.shift();
    closedSet.push(current);

    // Check if we've reached the end
    if (current === end) {
      noLoop();
      console.log("BFS Algorithm DONE!");
      endTime = millis();

      // Calculate and display the total distance
      const totalDistance = calculateTotalDistance(path);
      document.getElementById("totalDistance").innerHTML =
        "Total Distance: " + totalDistance.toFixed(2);

      document.getElementById("timeTaken").innerHTML =
        "Time taken: " + (endTime - startTime) + " ms";
      setTimeout(resetPathfinding, 2000);
      resetPathfinding();
      return;
    }

    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      // Check if neighbor is valid and not visited
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        // Check if it's already in the openSet
        if (!openSet.includes(neighbor)) {
          neighbor.previous = current;
          openSet.push(neighbor);
        }
      }
    }
  } else {
    console.log("no solution");
    noLoop();
    return;
  }
}

function restartSketch() {
  openSet = [];
  closedSet = [];
  path = [];
  startSet = false;
  endSet = false;
  algorithmSelected = false;
  current = undefined;
  loop();
  setup();
}

function dStarLite() {
  if (openSet.length > 0) {
    // Sort openSet to find the node with the lowest cost
    openSet.sort((a, b) => a.g + a.h - (b.g + b.h));
    current = openSet.shift(); // Get the best node

    if (current === end) {
      noLoop();
      console.log("D* Lite Algorithm DONE!");
      endTime = millis();

      // Calculate and display the total distance
      const totalDistance = calculateTotalDistance(path);
      document.getElementById("totalDistance").innerHTML =
        "Total Distance: " + totalDistance.toFixed(2);

      document.getElementById("timeTaken").innerHTML =
        "Time taken: " + (endTime - startTime) + " ms";
      setTimeout(resetPathfinding, 2000);
      resetPathfinding();
      return;
    }

    closedSet.push(current);
    let neighbors = current.neighbors;

    for (let neighbor of neighbors) {
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        const tentativeG = current.g + heuristic(current, neighbor);

        if (openSet.includes(neighbor)) {
          if (tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            neighbor.previous = current;
          }
        } else {
          neighbor.g = tentativeG;
          neighbor.previous = current;
          openSet.push(neighbor);
        }
      }
    }
  } else {
    console.log("no solution");
    noLoop();
    return;
  }
}

function modifyGrid() {
  const randomInRange = (min, max) => Math.random() * (max - min) + min;
  const min = 1;
  const max = 2;
  const randomValue = randomInRange(min, max);
  const numObstacles = randomValue; // Random number of obstacles to add

  for (let i = 0; i < numObstacles / 2; i++) {
    const x = Math.floor(random(cols));
    const y = Math.floor(random(rows));
    const spot = grid[x][y];

    // Ensure the spot is not the start or end
    if (spot !== start && spot !== end && !spot.wall) {
      spot.wall = true; // Change to wall
    }
  }
}

function dStar() {
  // This is a basic skeleton for D*
  // More complex logic can be added based on dynamic environment changes

  if (openSet.length > 0) {
    openSet.sort((a, b) => a.g + a.h - (b.g + b.h));
    current = openSet.shift(); // Get the best node

    if (current === end) {
      noLoop();
      console.log("D* Algorithm DONE!");
      endTime = millis();

      // Calculate and display the total distance
      const totalDistance = calculateTotalDistance(path);
      document.getElementById("totalDistance").innerHTML =
        "Total Distance: " + totalDistance.toFixed(2);

      document.getElementById("timeTaken").innerHTML =
        "Time taken: " + (endTime - startTime) + " ms";
      setTimeout(resetPathfinding, 2000);
      resetPathfinding();
      return;
    }

    closedSet.push(current);
    let neighbors = current.neighbors;

    for (let neighbor of neighbors) {
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        const tentativeG = current.g + heuristic(current, neighbor);

        if (openSet.includes(neighbor)) {
          if (tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            neighbor.previous = current;
          }
        } else {
          neighbor.g = tentativeG;
          neighbor.previous = current;
          openSet.push(neighbor);
        }
      }
    }
  } else {
    console.log("no solution");
    noLoop();
    return;
  }
}

function calculateTotalDistance(path) {
  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += dist(path[i].i, path[i].j, path[i + 1].i, path[i + 1].j);
  }

  return totalDistance;
}
