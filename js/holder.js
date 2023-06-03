class Holder {
  constructor(engine, render) {
    this.engine = engine;
    this.render = render;
    this.body = null;
    this.article = "";
  }

  beforeUpdate(controller) {
    var polygon = controller.selectedPoly;
    if (!polygon || polygon === this.body) {
      // if no polygon or polygon is the same
      return;
    }
    // delete last clone
    if (this.body) {
      Matter.World.remove(this.engine.world, this.body);
      this.body = null; // Also set this.body to null after removing it
    }

    var sides = polygon.vertices.length;
    var radius = getPolygonRadius(polygon) + 2.5;
    this.body = Matter.Bodies.polygon(
      this.render.canvas.width - 100, // position x
      100, // position y
      sides,
      radius,
      {
        render: {
          fillStyle: "transparent",
          strokeStyle: "#808080",
          lineWidth: 5,
          opacity: 1,
        }, // Change fillStyle to '#ls808080' for grey
        isStatic: true,
        isSensor: true,
      }
    );
    sides % 2 === 1 || sides === 6 // if odd-sided or a hexegon, rotate 90 degrees
      ? Matter.Body.setAngle(this.body, Math.PI / 2)
      : Matter.Body.setAngle(this.body, 0);
    Matter.World.add(engine.world, this.body);

    // forces & displays article if close enough
    let dx = this.body.position.x - polygon.position.x;
    let dy = this.body.position.y - polygon.position.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.linearForce(polygon, distance, dx, dy); // apply linear force
    if (distance < 50) {
      this.negateGravity(polygon);
      if (this.angularForce(polygon, distance)) {
        // apply angular force
        this.displayArticle(polygon.articleID);
      }
    } else {
      this.removeArticle();
    }
  }

  linearForce(polygon, distance, dx, dy) {
    let A = 0.0006; // peak height
    let B = 0; // position of the peak
    let C = 35; // distribution width
    let magnitude =
      A * Math.exp(-Math.pow(distance - B, 2) / (2 * Math.pow(C, 2))); // gaussian
    Matter.Body.applyForce(polygon, polygon.position, {
      x: magnitude * dx,
      y: magnitude * dy,
    });
  }

  angularForce(polygon, distance) {
    if (distance < 1) {
      // prevent division by zero
      return true;
    }
    // Calculate angular difference
    let angularDifference = this.body.angle - polygon.angle;
    // Normalize angular difference to be between -PI and PI
    angularDifference =
      ((angularDifference % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (angularDifference > Math.PI) {
      angularDifference -= 2 * Math.PI;
    }

    // Apply torque to rotate polygon
    let angularForce = (1 / distance) * angularDifference;
    Matter.Body.rotate(polygon, angularForce);

    return false;
  }

  negateGravity(polygon) {
    var gravity = engine.world.gravity;

    Matter.Body.applyForce(polygon, polygon.position, {
      x: -gravity.x * gravity.scale * polygon.mass,
      y: -gravity.y * gravity.scale * polygon.mass,
    });
  }

  displayArticle(articleId) {
    if (this.article === articleId) {
      // return if article is already displayed
      return;
    }
    controller.articleContainer.style.top = controller.selectedPoly.articlePos; // use stored scroll position of article

    fetch("../articles/" + articleId + ".html")
      .then((response) => response.text())
      .then((article) => {
        $("#article-container").html(article);
        this.articleDisplayed = true;
      });

    // set article id
    this.article = articleId;

    // get the key associated with this article
    let key = keys.find((key) => key.body.articleID === articleId);

    // if key exists, set the scroll position
    if (key) {
      controller.articleContainer.style.top = -key.body.scroll + "px";
    }
  }

  removeArticle() {
    if (!this.article) {
      // return if no article is displayed
      return;
    }
    $("#article-container").html(""); // clear the article container
    this.article = null; // unset article id
  }
}

// geometry bs
function getPolygonRadius(polygon) {
  // Calculate the centroid of the polygon
  let centroid = Matter.Vertices.centre(polygon.vertices);

  // Calculate the maximum distance from the centroid to any vertex
  let maxDistanceSquared = 0;
  for (let i = 0; i < polygon.vertices.length; i++) {
    let vertex = polygon.vertices[i];
    let distanceSquared = Matter.Vector.magnitudeSquared(
      Matter.Vector.sub(vertex, centroid)
    );
    maxDistanceSquared = Math.max(maxDistanceSquared, distanceSquared);
  }

  // Return the square root of the maximum distance squared as the radius
  return Math.sqrt(maxDistanceSquared);
}

window.Holder = Holder;
