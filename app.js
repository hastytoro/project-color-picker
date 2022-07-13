// GLOBAL SELECTORS AND VARIABLES
const colorDiv = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const hexTitles = document.querySelectorAll(".color h2");
let initialColors;
console.log();

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
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = color.darken(2);
    text.style.textShadow = `1px 1px 2px ${color.darken(1)}`;
  } else {
    text.style.color = color.brighten(2);
    text.style.textShadow = `1px 1px 2px ${color.brighten(1)}`;
  }
}

randomColors();
