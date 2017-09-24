if (self === top) {
  // Top-level. Allow dragging into past here.
  console.log(document.URL, 'content');

  const ns = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(ns, 'svg');
  svg.style.position = 'absolute';
  svg.style.top = 0;
  svg.style.left = 0;
  svg.style.height = '100%';
  svg.style.width = '100%';
  document.body.appendChild(svg);

  document.onmousedown = event => {
    if (!event.altKey) return;

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttributeNS(null, 'fill', 'blue');
    svg.appendChild(rect);

    let corner1 = [event.clientX, event.clientY];
    rect.setAttributeNS(null, 'x', corner1[0]);
    rect.setAttributeNS(null, 'y', corner1[1]);

    let corner2;

    // Draw a rectangle.
    document.onmousemove = event => {
      console.log('dragging');
      corner2 = [event.clientX, event.clientY];

      rect.setAttributeNS(null, 'width', corner2[0] - corner1[0]);
      rect.setAttributeNS(null, 'height', corner2[1] - corner1[1]);
    };

    document.onmouseup = event => {
      document.onmousemove = null;
      document.onmouseup = null;
    }

    // Suppress these events for the web page itself.
    return false;
  }
}
