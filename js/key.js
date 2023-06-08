class Key {
  constructor(engine, sides, color, ID) {
    this.radius =
      render.options.width * 0.08 < 50 ? render.options.width * 0.08 : 50;
    this.body = Matter.Bodies.polygon(
      randomGaussian(render.options.width * 0.5, render.options.width * 0.1),
      Math.random() * -1000,
      sides,
      this.radius,
      {
        density: 0.001,
        frictionAir: 0.04,
        restitution: 0.9,
        friction: 0.01,
        render: {
          fillStyle: color,
        },
      }
    );
    this.body.articleID = ID;
    this.body.articlePos = "0px";
    // add to world
    Matter.Body.setMass(this.body, 5);
    Matter.Body.setAngle(this.body, Math.random());
    Matter.World.add(engine.world, this.body);

    // resize event
    window.addEventListener("resize", () => {
      const currentRadius = this.radius;
      const newRadius = render.options.width * 0.08;
      if (newRadius < 50) {
        const radiusRatio = newRadius / currentRadius;
        Matter.Body.scale(this.body, radiusRatio, radiusRatio);
        this.radius = newRadius;
      }
    });
  }

  respawn() {
    if (this.body.position.y > render.canvas.height + 50) {
      Matter.Body.setPosition(this.body, {
        x: randomGaussian(render.options.width, render.options.width),
        y: Math.random() * -100 - 50,
      });
      Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
      Matter.Body.setAngle(this.body, Math.random());
    }
  }
}

window.Key = Key;

// HELPERS - random
function randomGaussian(mean, stdDev) {
  let u1 = Math.random();
  let u2 = Math.random();
  let randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return Math.abs(mean + stdDev * randStdNormal); // no negatives
}
function randomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function randomPastelColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 70) + 25;
  const l = Math.floor(Math.random() * 10) + 85;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
