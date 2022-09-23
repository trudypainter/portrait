var ballPositions = [
  [1, 1, "http://trudy.computer/"],
  [1, 3, "https://www.are.na/trudy-painter"],
  [2, 2, "https://github.com/trudypainter"],
  [2, 4, ""],
  [
    3,
    1,
    "https://docs.google.com/spreadsheets/d/1pBokIjBV7lxDYNxqqxfLrNb7h3h4GuhWSbrrTGd9Fho/edit?usp=sharing",
  ],
  [
    3,
    5,
    "https://open.spotify.com/user/trudypaintet?si=ZlW6diDKSl61x9oKhit5BA",
  ],
  [5, 1, "https://www.linkedin.com/in/trudy-painter/"],
  [1, 5, "https://vsco.co/bionicpinkytoe/gallery"],
];

var handle_len_rate = 2.4;
var circlePaths = [];
var radius = 50;
var SCALE = 240;
for (var i = 0, l = ballPositions.length; i < l; i++) {
  var circlePath = new Path.Circle({
    center: [ballPositions[i][0] * SCALE, ballPositions[i][1] * SCALE],
    radius: 120,
    fillColor: "#00ff00",
  });
  circlePaths.push(circlePath);
}

var largeCircle = new Path.Circle({
  center: [676, 433],
  radius: 160,
  fillColor: "#00ff00",
});
circlePaths.push(largeCircle);

function onMouseMove(event) {
  largeCircle.position = event.point;
  generateConnections(circlePaths);
}

function onMouseDown(event) {
  console.log(event.event.x);

  console.log(
    event.event.x,
    ballPositions[0][0] * SCALE + radius,
    ballPositions[0][0] * SCALE - radius
  );
  for (var i = 0, l = ballPositions.length; i < l; i++) {
    if (
      event.event.x < ballPositions[i][0] * SCALE + radius &&
      event.event.x > ballPositions[i][0] * SCALE - radius &&
      event.event.y < ballPositions[i][1] * SCALE + radius &&
      event.event.y > ballPositions[i][1] * SCALE - radius
    ) {
      console.log(ballPositions[i]);
      window.open(ballPositions[i][2]);
    }
  }
}

var connections = new Group();
function generateConnections(paths) {
  // Remove the last connection paths:
  connections.children = [];

  for (var i = 0, l = paths.length; i < l; i++) {
    for (var j = i - 1; j >= 0; j--) {
      var path = metaball(paths[i], paths[j], 0.5, handle_len_rate, 300);
      if (path) {
        connections.appendTop(path);
        path.removeOnMove();
      }
    }
  }
}

generateConnections(circlePaths);

// ---------------------------------------------
function metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
  var center1 = ball1.position;
  var center2 = ball2.position;
  var radius1 = ball1.bounds.width / 2;
  var radius2 = ball2.bounds.width / 2;
  var pi2 = Math.PI / 2;
  var d = center1.getDistance(center2);
  var u1, u2;

  if (radius1 == 0 || radius2 == 0) return;

  if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
    return;
  } else if (d < radius1 + radius2) {
    // case circles are overlapping
    u1 = Math.acos(
      (radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d)
    );
    u2 = Math.acos(
      (radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d)
    );
  } else {
    u1 = 0;
    u2 = 0;
  }

  var angle1 = (center2 - center1).getAngleInRadians();
  var angle2 = Math.acos((radius1 - radius2) / d);
  var angle1a = angle1 + u1 + (angle2 - u1) * v;
  var angle1b = angle1 - u1 - (angle2 - u1) * v;
  var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
  var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
  var p1a = center1 + getVector(angle1a, radius1);
  var p1b = center1 + getVector(angle1b, radius1);
  var p2a = center2 + getVector(angle2a, radius2);
  var p2b = center2 + getVector(angle2b, radius2);

  // define handle length by the distance between
  // both ends of the curve to draw
  var totalRadius = radius1 + radius2;
  var d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

  // case circles are overlapping:
  d2 *= Math.min(1, (d * 2) / (radius1 + radius2));

  radius1 *= d2;
  radius2 *= d2;

  var path = new Path({
    segments: [p1a, p2a, p2b, p1b],
    style: ball1.style,
    closed: true,
  });
  var segments = path.segments;
  segments[0].handleOut = getVector(angle1a - pi2, radius1);
  segments[1].handleIn = getVector(angle2a + pi2, radius2);
  segments[2].handleOut = getVector(angle2b - pi2, radius2);
  segments[3].handleIn = getVector(angle1b + pi2, radius1);
  return path;
}

// ------------------------------------------------
function getVector(radians, length) {
  return new Point({
    // Convert radians to degrees:
    angle: (radians * 180) / Math.PI,
    length: length,
  });
}
