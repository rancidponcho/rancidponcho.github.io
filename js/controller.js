class Controller {
  constructor(engine, render, matterContainer) {
    this.engine = engine;
    this.matterContainer = matterContainer;
    this.articleContainer = document.getElementById("article-container");
    this.scrollProportion = 0;
    this.selectedPoly = null;

    // matter-js mouseConstraint
    this.mouse = Matter.Mouse.create(render.canvas);
    this.mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: this.mouse,
      constraint: {
        render: { visible: false },
        stiffness: 0, // disable default click
      },
    });
    Matter.World.add(engine.world, this.mouseConstraint);

    // scroll
    this.articleContainer.style.top = "0px";
    this.matterContainer.addEventListener("wheel", (e) => {
      this.wheelEvent(e);
    });

    // setup resize event
    window.addEventListener("resize", () => {
      this.matterContainer.scrollLeft = this.scrollProportion * this.matterContainer.scrollWidth;
    });
  }

  wheelEvent(e) {
    e.preventDefault();

      let newTop = parseInt(this.articleContainer.style.top) - e.deltaY;                            // calculate new top position of the article container.
      let maxScrollTop = this.articleContainer.scrollHeight - this.articleContainer.clientHeight;   // dont scroll past the end or the start of the article.
      if (newTop <= 0 && newTop >= -maxScrollTop) {
        this.articleContainer.style.top = newTop + "px";
      } 

    // save the new article position to key
    this.selectedPoly.articlePos = this.articleContainer.style.top;
  }

  findClosestKey(mousePosition) {
    let minDistance = Infinity;
    Matter.Composite.allBodies(this.engine.world).forEach((body) => {
      let dx = mousePosition.x - body.position.x;
      let dy = mousePosition.y - body.position.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        this.selectedPoly = body;
      }
    });
  }

  mouseAttract() {
    if (this.mouseConstraint.mouse.button === -1) {
      return;
    }

    let mousePosition = this.mouseConstraint.mouse.position;
    this.findClosestKey(mousePosition);

    // other keys
    Matter.Composite.allBodies(this.engine.world).forEach((body) => {
      // apply attractive force
      let dx = mousePosition.x - body.position.x;
      let dy = mousePosition.y - body.position.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Attractive force
      let A = 0.00004; // peak height
      let B = 0; // position of the peak
      let C = 100; // distribution width
      // selected key gets greater attraction
      if (body === this.selectedPoly) {
        A = 0.0005;
        B = 0;
        C = 100;
      }
      let magnitude = A * Math.exp(-Math.pow(distance - B, 2) / (2 * Math.pow(C, 2))); // Gaussian function
      // let forceMagnitude = 0.0005 * Math.exp(-0.025 * distance); // exponential decay

      Matter.Body.applyForce(body, body.position, {
        x: magnitude * dx,
        y: magnitude * dy,
      });
    });
  }
}

window.Controller = Controller;
