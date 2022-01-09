import * as React from 'react';

interface IGodRaysProps {
  raised?: boolean;
}

export class GodRays extends React.Component<IGodRaysProps> {
  state = {
    width: 0,
    height: 0,
    rays: [...new Array(6)].map(() => ({
      angle: Math.random() * 1.4 - 0.7,
      iterator: Math.random() > 0.5 ? 1 : -1,
      speed: Math.random() * 0.0005 + 0.0005,
      weight: Math.random() * 300,
      opacity: Math.random(),
      pulsar: Math.random() > 0.5 ? 1 : -1,
    })),
    particles: [],
  };

  init = () => {
    window.requestAnimationFrame(() => this.draw());

    this.inc = 1;
  };

  draw = () => {
    if (this.props.raised || !this.canvas) {
      return setTimeout(() => window.requestAnimationFrame(this.draw), 500);
    }

    const { width, height, rays } = this.state;

    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.globalCompositeOperation = 'luminosity';
    ctx.clearRect(0, 0, width, height + 100); // clear canvas
    ctx.save();

    rays.forEach(({ angle, iterator, weight, speed, pulsar, opacity }, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height * 1.3);
      gradient.addColorStop(0.2, `rgba(160, 255, 60, ${opacity * 0.1})`);
      gradient.addColorStop(1, 'rgba(160, 255, 60, 0)');

      const gradient2 = ctx.createLinearGradient(0, 0, 0, height * 1.3);
      gradient2.addColorStop(0.2, `rgba(60, 255, 200, ${opacity * 0.2})`);
      gradient2.addColorStop(1, 'rgba(60, 255, 200, 0)');

      ctx.save();
      ctx.translate(width / 2, -900);
      ctx.rotate(angle);
      ctx.translate(-width / 2, 900);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.moveTo(width / 2 - weight / 2, -900);
      ctx.lineTo(width / 2 + weight / 2, -900);
      ctx.lineTo(width / 2 + (weight / 2 + 300), height * 1.4);
      ctx.lineTo(width / 2 - (weight / 2 + 300), height * 1.4);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.fillStyle = gradient2;
      ctx.moveTo(width / 2 - weight / 6, -900);
      ctx.lineTo(width / 2 + weight / 6, -900);
      ctx.lineTo(width / 2 + (weight / 6 + 50), height * 1.4);
      ctx.lineTo(width / 2 - (weight / 6 + 250), height * 1.4);
      ctx.fill();
      ctx.closePath();

      rays[index].angle += iterator * speed;
      rays[index].opacity += pulsar * 0.01;

      if (rays[index].angle > 0.8) rays[index].iterator = -1;
      if (rays[index].angle < -0.8) rays[index].iterator = 1;

      if (rays[index].opacity >= 1) rays[index].pulsar = -1;
      if (rays[index].opacity <= 0) rays[index].pulsar = 1;

      ctx.restore();
    });

    setTimeout(() => window.requestAnimationFrame(this.draw), 1000 / 15);
  };

  componentDidMount() {
    const { innerWidth: width, innerHeight: height } = window;
    this.setState({ width, height });
    this.init();
  }

  render() {
    const { width, height } = this.state;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <canvas
          width={width}
          height={height + 100}
          style={{
            filter: 'blur(50px)',
            position: 'relative',
            top: -100,
          }}
          ref={el => {
            this.canvas = el;
          }}
        />
      </div>
    );
  }

  canvas: HTMLCanvasElement | null | undefined;

  inc;
}
