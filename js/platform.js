class Platform {
  constructor(engine, aspect_ratio) {
    this.body = Matter.Bodies.rectangle(
      render.options.width * 0.5,
      render.options.height * INV_GOLDEN,
      render.options.width * INV_GOLDEN,
      render.options.height * 0.1,
      {
        isStatic: true,
        render: { fillStyle: randomPastelColor() },
      }
    );
    Matter.World.add(engine.world, this.body);
    this.isHidden = false;
    this.currentScale = 1;
    this.targetScale = 1;
  }

  show() {
    if (!this.isHidden) return;
    this.isHidden = false;
    this.targetScale = 1;
  }

  hide() {
    if (this.isHidden) return;
    this.isHidden = true;
    this.targetScale = 0;
  }

  resize() {
    const currentWidth = this.body.bounds.max.x - this.body.bounds.min.x;
    const currentHeight = this.body.bounds.max.y - this.body.bounds.min.y;
    const newWidth = render.options.width * INV_GOLDEN;
    const newHeight = render.options.height * 0.1;
    const widthRatio = newWidth / currentWidth;
    const heightRatio = newHeight / currentHeight;
    Matter.Body.setPosition(this.body, {
      x: render.options.width * 0.5,
      y: render.options.height * 0.8,
    });
    Matter.Body.scale(this.body, widthRatio, heightRatio);
  }

  update() {
    const deltaScale = (this.targetScale - this.currentScale) / 10; // adjust speed here
    Matter.Body.scale(
      this.body,
      1 + deltaScale / this.currentScale,
      1 + deltaScale / this.currentScale
    );
    this.currentScale += deltaScale;

    if (this.currentScale < 0.01) {
      this.body.render.visible = false;
      this.body.collisionFilter = {
        group: -1,
        category: 0x0002,
        mask: 0x0004,
      };
    } else {
      this.body.render.visible = true;
      this.body.collisionFilter = {
        group: 0,
        category: 0x0001,
        mask: 0xffffffff,
      };
    }
  }
}

window.Platform = Platform;
