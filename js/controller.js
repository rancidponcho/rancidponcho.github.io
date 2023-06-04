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
    // pc
    this.articleContainer.style.top = "0px";
    this.matterContainer.addEventListener("wheel", (e) => {
      e.preventDefault();

      let newTop = parseInt(this.articleContainer.style.top) - e.deltaY; // calculate new top position of the article container.
      let maxScrollTop =
        this.articleContainer.scrollHeight - this.articleContainer.clientHeight; // dont scroll past the end or the start of the article.
      if (newTop <= 0 && newTop >= -maxScrollTop) {
        this.articleContainer.style.top = newTop + "px";
      }
      // save the new article position to key
      this.selectedPoly.articlePos = this.articleContainer.style.top;
    });
    // mobile
    let startY; // variable to store the starting touch position

    // add touchstart event listener to store the starting touch position
    let canvas = document.getElementById("canvas");
    canvas.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    });

    // add touchmove event listener to update the position of the article container
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      let deltaY = startY - e.touches[0].clientY; // calculate the change in touch position
      let newTop = parseInt(this.articleContainer.style.top) - deltaY; // calculate new top position of the article container
      let maxScrollTop =
        this.articleContainer.scrollHeight - this.articleContainer.clientHeight; // don't scroll past the end or the start of the article
      if (newTop <= 0 && newTop >= -maxScrollTop) {
        this.articleContainer.style.top = newTop + "px";
      }
      // save the new article position to key
      this.selectedPoly.articlePos = this.articleContainer.style.top;

      // hide address bar on scroll down
      if (deltaY > 0) {
        window.scrollTo(0, 1);
      } else if (deltaY < 0) {
        window.scrollTo(0, 0);
      }

      // update startY to store the current touch position
      startY = e.touches[0].clientY;
    });

    // fade out on press
    // pc
    const about = document.getElementById("about");
    const container = document.getElementById("container");
    container.addEventListener("mousedown", () => {
      about.classList.add("fade-out");
      // about.classList.add("no-pointer-events");
      // container.removeEventListener("mousedown", () => {});
    });
    // mobile
    container.addEventListener("touchstart", () => {
      about.classList.add("fade-out");
      // about.classList.add("no-pointer-events");
      // container.removeEventListener("touchstart", () => {});
    });

    // resize event
    window.addEventListener("resize", () => {
      this.matterContainer.scrollLeft =
        this.scrollProportion * this.matterContainer.scrollWidth;
    });
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
      let magnitude =
        A * Math.exp(-Math.pow(distance - B, 2) / (2 * Math.pow(C, 2))); // Gaussian function
      // let forceMagnitude = 0.0005 * Math.exp(-0.025 * distance); // exponential decay

      Matter.Body.applyForce(body, body.position, {
        x: magnitude * dx,
        y: magnitude * dy,
      });
    });
  }
}

window.Controller = Controller;
