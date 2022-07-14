// GLOBAL SELECTORS AND VARIABLES
const colorDiv = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const hexTitles = document.querySelectorAll(".color h2");
let initialColors;

// FUNCTIONS
// custom color generator:
function customGenerator() {
  let letters = "0123456789ABCDEF";
  let hash = "#";
  for (let i = 0; i < 6; i++) {
    hash += letters[Math.floor(Math.random() * 16)];
  }
  return hash;
}
// instead use `chroma.js` 🥳!
const generateHex = () => chroma.random();

function randomColors() {
  colorDiv.forEach((div, index) => {
    const hexTitle = div.children[0];
    const randomColor = generateHex();
    // update background and text:
    div.style.background = randomColor;
    hexTitle.innerText = randomColor;
    // check for contrast:
    checkTextContrast(randomColor, hexTitle);
    // slider configuration:
    const sliders = div.querySelectorAll(".sliders input");
    const [hue, brightness, saturation] = sliders;
    colorizeSliders(randomColor, hue, brightness, saturation);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
    // text.style.color = color.darken(2);
    // text.style.textShadow = `1px 1px 1px ${color.darken(1)}`;
  } else {
    text.style.color = "white";
    // text.style.color = color.brighten(2);
    // text.style.textShadow = `1px 1px 1px ${color.brighten(1)}`;
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // brightness:
  const mid_bright = color.set("hsl.l", 0.5);
  const scale_bright = chroma.scale(["black", mid_bright, "white"]);
  // saturation:
  const no_sat = color.set("hsl.s", 0);
  const full_sat = color.set("hsl.s", 1);
  const scale_sat = chroma.scale([no_sat, color, full_sat]);

  // update input with scaling gradients:
  hue.style.backgroundImage = `linear-gradient(to right,
    rgb(204, 75, 75),
    rgb(204, 204, 75),
    rgb(75, 204, 75),
    rgb(75, 204, 204),
    rgb(75, 75, 204),
    rgb(204, 75, 204),
    rgb(204, 75, 75)
  )`;
  saturation.style.backgroundImage = `linear-gradient(to right,
    ${scale_sat(0)}, ${scale_sat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,
    ${scale_bright(0)}, ${scale_bright(0.5)}, ${scale_bright(1)}
  )`;
}

randomColors();
