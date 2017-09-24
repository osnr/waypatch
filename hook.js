if (self === top) {
  // Top-level frame. Allow dragging into past, then.
  const urlGroups = /\/web\/([0-9]+)\/(.*$)/.exec(document.URL);
  const currentTimestamp = urlGroups[1];
  const currentUrl = urlGroups[2];
  
  (async function() {
    await fetchHistory();
    setupPatching();
  })();

  const history = [];
  async function fetchHistory() {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://web.archive.org/web/timemap/json/${currentUrl}`
    );
    const data = await response.json();
    for (let i = 1; i < data.length; i++) {
      const [timestamp, url] = [data[i][1], data[i][2]];
      const splitTimestamp = /^([0-9]{4})([0-9]{2})([0-9]{2})(.*$)/.exec(timestamp);
      history.push({
        text: `${splitTimestamp[1]}-${splitTimestamp[2]}-${splitTimestamp[3]} ${splitTimestamp[4]}`,
        timestampUrl: timestamp + '/' + url
      })
      if (timestamp === currentTimestamp) return;
    }
  }

  function setupPatching() {
    document.onmousedown = event => {
      if (!event.altKey) return;

      const rect = document.createElement("div");
      rect.style.position = "absolute";
      rect.style.opacity = 1;
      rect.style.overflow = "hidden";

      // Colored overlay for each rect.
      const rectOverlay = document.createElement("div");
      rectOverlay.style.backgroundColor = randomHsl();
      rectOverlay.style.position = "absolute";
      rectOverlay.style.top = 0;
      rectOverlay.style.left = 0;
      rectOverlay.style.bottom = 0;
      rectOverlay.style.right = 0;
      rectOverlay.style.zIndex = 100;
      rectOverlay.style.opacity = 1;
      rectOverlay.style.pointerEvents = "none";
      rect.appendChild(rectOverlay);

      document.body.appendChild(rect);

      let corner1 = [event.pageX, event.pageY];
      rect.style.left = corner1[0];
      rect.style.top = corner1[1];

      let corner2;

      // Draw a rectangle.
      document.onmousemove = event => {
        console.log('dragging');
        corner2 = [event.pageX, event.pageY];

        rect.style.width = corner2[0] - corner1[0];
        rect.style.height = corner2[1] - corner1[1];
      };

      document.onmouseup = event => {
        document.onmousemove = null;
        document.onmouseup = null;

        makeTravelable(rect, rectOverlay);
      }

      // Suppress these events for the web page itself.
      return false;
    }
  }

  function makeTravelable(rect, rectOverlay) {
    rect.onmousedown = event => {
      rectOverlay.style.opacity = 1;

      const rectX = parseInt(rect.style.left);
      const rectY = parseInt(rect.style.top);

      const origX = event.pageX;

      let targetTimestampUrl = currentTimestamp + "/" + currentUrl;
      document.onmousemove = event => {
        const newX = event.pageX;
        console.log(history.length, history[history.length - Math.floor(origX - newX)]);
        choice = history[history.length - Math.floor(origX - newX)]
        rectOverlay.innerText = choice.text;
        targetTimestampUrl = choice.timestampUrl;
        return false;
      }
      document.onmouseup = event => {
        rect.onmousedown = null;
        document.onmousemove = null;
        document.onmouseup = null;

        const ifr = document.createElement("iframe");
        ifr.src = `https://web.archive.org/web/${targetTimestampUrl}`;
        ifr.style.position = "relative";
        ifr.style.width = "1000px";
        ifr.style.height = "1000px";
        ifr.style.border = "none";
        ifr.style.top = -rectY;
        ifr.style.left = -rectX;

        ifr.onload = () => {
          rectOverlay.innerText = "";
          rectOverlay.style.opacity = 0.2;
        };

        rect.appendChild(ifr);

        return false;
      }
    }
  }

} else {
  try {
    document.getElementById("wm-ipp").style.display = "none";
  } catch (e) {}
}

// Via https://stackoverflow.com/questions/1484506/random-color-generator
function randomHsl() {
  return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}
