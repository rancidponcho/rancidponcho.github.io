console.log("script.js loaded");
//---------------------------//
const INV_GOLDEN = 0.618; // 0.61803398875
const HALF_INV_GOLDEN = INV_GOLDEN * 0.5;
let aspect_ratio = window.innerWidth / window.innerHeight;
// should add const key radius

// resize to match div
let div = document.getElementById("canvas");
function resizeDiv() {
  div.style.width = window.innerWidth + "px";
  div.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resizeDiv);
resizeDiv();

/* init matter-js */
let engine = Matter.Engine.create();
let runner = Matter.Runner.create({
  isFixed: true,
  delta: 1000 / 60,
});
let render = Matter.Render.create({
  element: div,
  engine: engine,
  options: {
    width: div.clientWidth,
    height: div.clientHeight,
    wireframes: false,
    background: "rgb(255, 255,255)",
  },
});

let container = document.getElementById("container");
let controller = new window.Controller(engine, render, container);
let holder = new window.Holder(engine, render);
let platform = new window.Platform(
  engine,
  render.options.width / render.options.height
);

/* spawn keys */
let keys = [];
let articleIDs = [
  "article1",
  "article2",
  "article3",
  "article4",
  "article5",
  "article6",
];
for (let i = 0; i < 2; i++) {
  let key = new window.Key(engine, articleIDs[i]);
  keys.push(key);
}

let lastTimestep = 0;
let frameCount = 0;
/* before update */
Matter.Events.on(engine, "beforeUpdate", () => {
  // fps
  if (!lastTimestep) {
    lastTimestep = engine.timing.timestamp;
  }
  const elapsed = engine.timing.timestamp - lastTimestep;
  frameCount++;
  if (elapsed >= 1000) {
    const fps = frameCount / (elapsed / 1000);
    frameCount = 0;
    lastTimestep = engine.timing.timestamp;
  }

  //
  controller.mouseAttract();
  holder.beforeUpdate(controller);
});

/* after update */
Matter.Events.on(engine, "afterUpdate", function () {
  keys.forEach(function (key) {
    key.respawn(); // respawn new if key falls off canvas
  });
});

Matter.Runner.run(runner, engine);
Matter.Render.run(render);

function resizeCanvas() {
  aspect_ratio = window.innerWidth / window.innerHeight;

  render.canvas.width = div.clientWidth;
  render.canvas.height = div.clientHeight;
  render.options.width = div.clientWidth;
  render.options.height = div.clientHeight;

  // platform
  platform.resize();
}
window.addEventListener("resize", resizeCanvas);

// let manager = new window.Manager();
// manager.spawnKeys(2);
// manager.beforeUpdate();
// manager.afterUpdate();
// manager.run();