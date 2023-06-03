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

    // calculate the current scroll proportion
    this.scrollProportion = this.matterContainer.scrollLeft / (this.matterContainer.scrollWidth - this.matterContainer.clientWidth);

    // Check if at the end of the horizontal scroll or if scrolling up from the vertical scroll.
    if (
      this.scrollProportion >= 1.0 || // end of the horizontal scroll
      (e.deltaY < 0 && parseInt(this.articleContainer.style.top) < 0) // scrolling up from the vertical scroll
    ) {
      let newTop = parseInt(this.articleContainer.style.top) - e.deltaY;                            // calculate new top position of the article container.
      let maxScrollTop = this.articleContainer.scrollHeight - this.articleContainer.clientHeight;   // dont scroll past the end or the start of the article.
      if (newTop <= 0 && newTop >= -maxScrollTop) {
        this.articleContainer.style.top = newTop + "px";
      } else if (newTop > 0) {  // scroll past the start of the vertical scroll, start the horizontal scroll again
        this.articleContainer.style.top = "0px";
        this.matterContainer.scrollLeft += e.deltaY;
      }
    } else {
      this.matterContainer.scrollLeft += e.deltaY;  // not at the end, so continue with the horizontal scroll.
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
