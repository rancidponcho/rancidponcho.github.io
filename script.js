/*******************************************************************************
 *  Initialize Matter.js Components
 *
 *  Matter.js ships as a single global namespace called `Matter`. We extract
 *  the specific modules we intend to use (Engine, Render, Runner, etc.) so we
 *  can reference them directly without repeatedly writing `Matter.<module>`.
 *
 *  This is conceptually similar to resolving symbol addresses up front in
 *  assembly rather than hard-coding their full paths throughout the program.
 ******************************************************************************/
const {
    Engine, Render, Runner, World, Bodies, Body, Composite
} = Matter;


/*******************************************************************************
 *  Acquire Canvas Handle
 *
 *  The HTML page contains a <canvas> element which will serve as our rendering
 *  surface. Matter.js does not create the canvas for us — it only draws into
 *  one. Here we obtain a reference to that canvas so the renderer can target it.
 ******************************************************************************/
const canvas = document.getElementById('world');


/*******************************************************************************
 *  Create Physics Engine and Renderer
 *
 *  The Engine object advances the physics simulation (time steps, forces,
 *  collisions), while Render draws the resulting world state each frame.
 *
 *  We enable a standard Earth-like downward gravity and instruct the renderer
 *  to draw filled shapes rather than wireframes. The pixel ratio is applied so
 *  that rendering scales appropriately on HiDPI monitors.
 ******************************************************************************/
const engine = Engine.create({ gravity: { x: 0, y: 1 } });
const world  = engine.world;

const render = Render.create({
    canvas,
    engine,
    options: {
        wireframes: false,
        background: '#0f1115',
        pixelRatio: window.devicePixelRatio || 1
    }
});


/*******************************************************************************
 *  Utility Functions — Viewport Metrics
 *
 *  These helpers provide access to viewport dimensions and the screen center.
 *  Matter.js uses pixel coordinates for physics units by default, so screen
 *  measurements map directly onto the physics world without conversion.
 *
 *  As the browser resizes, these values change, ensuring all layout decisions
 *  remain responsive.
 ******************************************************************************/
function dpr() { return render.options.pixelRatio; }
function W()   { return window.innerWidth; }
function H()   { return window.innerHeight; }
function CX()  { return W() * 0.5; }
function CY()  { return H() * 0.5; }


/*******************************************************************************
 *  Platform Body
 *
 *  We create a static rectangle positioned at the center of the screen. Static
 *  bodies do not move or respond to forces, but they still participate fully
 *  in collision resolution. Other bodies will be able to stack and slide on it.
 *
 *  The dimensions are expressed as fractions of the viewport so the platform
 *  remains visually proportional regardless of screen resolution.
 ******************************************************************************/
const PLATFORM_W = W() / 3;
const PLATFORM_H = H() / 25;

const platform = Bodies.rectangle(CX(), CY(), PLATFORM_W, PLATFORM_H, {
    isStatic: true,
    render: { fillStyle: '#9ae6b4' }
});

World.add(world, platform);


/*******************************************************************************
 *  Resize Handling (Canvas + Platform Rescale)
 *
 *  Browsers can resize at any moment. When that happens:
 *      1) The canvas must be resized so the simulation remains full-screen.
 *      2) The platform must be rescaled to match our chosen proportions.
 *
 *  We track the platform’s current size so we can apply a precise scale factor
 *  from its current dimensions to the new target dimensions, avoiding runaway
 *  scaling. After resizing, we re-center the body to maintain layout symmetry.
 ******************************************************************************/
let platW = PLATFORM_W;
let platH = PLATFORM_H;

function resize() {
    const ratio = dpr();

    render.canvas.width  = Math.floor(W() * ratio);
    render.canvas.height = Math.floor(H() * ratio);
    render.options.width  = W();
    render.options.height = H();
    Matter.Render.setPixelRatio(render, ratio);

    const targetW = W() / 3;
    const targetH = H() / 25;

    const sx = targetW / platW;
    const sy = targetH / platH;
    Matter.Body.scale(platform, sx, sy);

    platW = targetW;
    platH = targetH;

    Body.setPosition(platform, { x: CX(), y: CY() });
}

window.addEventListener('resize', resize);
resize();


/*******************************************************************************
 *  Begin Simulation
 *
 *  The Runner steps the physics engine at a fixed timestep, and the Render loop
 *  draws each new state. Once started, Matter.js continues simulating until the
 *  page is closed or the engine is explicitly halted.
 ******************************************************************************/
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
