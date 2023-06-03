class Platform {
  constructor(engine, aspect_ratio) {
    this.body = Matter.Bodies.rectangle(
      render.options.width * 0.5,
      render.options.height * INV_GOLDEN,
      render.options.width * INV_GOLDEN,
      render.options.height * 0.1,
      {
        isStatic: true,
        render: { fillStyle: randomColor() },
      }
    );

    Matter.World.add(engine.world, this.body);
  }

  show() {
    this.body.render.visible = true;
    this.body.collisionFilter = {
      group: 0,
      category: 0x0001,
      mask: 0xffffffff,
    };
  }

  hide() {
    this.body.render.visible = false;
    this.body.collisionFilter = {
      group: -1,
      category: 0x0002,
      mask: 0x0004,
    };
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
      y: render.options.height * INV_GOLDEN,
    });
    Matter.Body.scale(this.body, widthRatio, heightRatio);
  }
}

window.Platform = Platform;
