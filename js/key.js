class Key {
  constructor(engine, ID) {
    this.radius = 50;
    this.sides = randInt(3, 6);
    this.body = Matter.Bodies.polygon(
      randomGaussian(
        render.options.width * 0.5,
        render.options.width * 0.1
      ),
      Math.random() * -1000,
      this.sides,
      this.radius,
      {
        density: 0.001,
        frictionAir: 0.04,
        restitution: 0.9,
        friction: 0.01,
        render: {
          fillStyle: randomColor(),
        },
      }
    );
    this.body.articleID = ID;
    this.body.articlePos = "0px";
    // add to world
    Matter.Body.setAngle(this.body, Math.random());
    Matter.World.add(engine.world, this.body);
  }

  respawn() {
    if (this.body.position.y > render.canvas.height) {
      Matter.Body.setPosition(this.body, {
        x: randomGaussian(
          render.options.width * 0.5,
          render.options.width * 0.1
        ),
        y: Math.random() * -1000,
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
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}