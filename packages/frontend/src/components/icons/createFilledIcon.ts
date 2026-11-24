import { createLucideIcon, LucideIconNode } from 'lucide-react';

/**
 * Turns a lucide outline into a solid icon: fill only, scaled up to the
 * stroked outline's footprint. A fill plus a stroke would overlap at the
 * edge and show a ring whenever the colour is translucent.
 */
export const createFilledIcon = (name: string, node: LucideIconNode[]) =>
  createLucideIcon({
    name,
    size: 24,
    node: node.map(([tag, attrs]) => [
      tag,
      {
        ...attrs,
        fill: 'currentColor',
        stroke: 'none',
        transform: 'translate(12 12) scale(1.1) translate(-12 -12)',
      },
    ]),
  });
