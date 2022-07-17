// ! GLOBAL SELECTORS AND VARIABLES
const colorContainer = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const hexTitles = document.querySelectorAll(".color h2");
const popupBox = document.querySelector(".copy-wrapper");
const sliderContainer = document.querySelectorAll(".sliders");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeBtn = document.querySelectorAll(".close-adjustment");
let initialColors;
// Section for local storage:
let savedPallettes = [];

// ! EVENT LISTENERS
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorContainer.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateHexTitle(index);
  });
});
hexTitles.forEach((hex) => {
  hex.addEventListener("click", () => {
    clipboardCopy(hex);
  });
});
popupBox.addEventListener("transitionend", () => {
  const popup = popupBox.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openSliderPanel(index);
  });
});
closeBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeSliderPanel(index);
  });
});
generateBtn.addEventListener("click", () => {
  randomColors();
});
lockBtn.forEach((button, index) => {
  button.addEventListener("click", (event) => {
    lockColor(event, index);
  });
});

// ! GENERAL FUNCTIONS
// custom color generator:
function customGenerator() {
  let letters = "0123456789ABCDEF";
  let hash = "#";
  for (let i = 0; i < 6; i++) {
    hash += letters[Math.floor(Math.random() * 16)];
  }
  return hash;
}
// Instead use `chroma.js` 🥳!
const generateHex = () => chroma.random();

function randomColors() {
  initialColors = [];
  colorContainer.forEach((colorDiv, index) => {
    const hexTitle = colorDiv.children[0];
    const icons = colorDiv.querySelectorAll(".controls button");
    const randomColor = generateHex();
    console.log(colorDiv.classList.contains("locked"));
    if (colorDiv.classList.contains("locked")) {
      // If locked push default into array and exit
      initialColors.push(hexTitle.innerText);
      console.log(initialColors);
      return; // exit logic "out of forEach iteration"
    } else {
      // Otherwise append new value to `initialColors`
      initialColors.push(chroma(randomColor).hex());
      console.log(initialColors);
    }
    // Update background and text:
    colorDiv.style.background = randomColor;
    hexTitle.innerText = randomColor;
    // Checking for title and icon contrast changes:
    checkContrast(randomColor, hexTitle);
    for (let icon of icons) {
      checkContrast(randomColor, icon);
    }
    // Slider configuration:
    const sliders = colorDiv.querySelectorAll(".sliders input");
    const [hue, brightness, saturation] = sliders;
    sliderColorize(randomColor, hue, brightness, saturation);
  });
  sliderReset();
}

function checkContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    // text.style.color = "black";
    text.style.color = color.darken(3);
    text.style.textShadow = `1px 1px 2px ${color.darken(1)}`;
  } else {
    // text.style.color = "white";
    text.style.color = color.brighten(2);
    text.style.textShadow = `1px 1px 2px ${color.brighten(1)}`;
  }
}

function sliderColorize(color, hue, brightness, saturation) {
  // Brightness:
  const mid_bright = color.set("hsl.l", 0.5);
  const scale_bright = chroma.scale(["black", mid_bright, "white"]);
  // Saturation:
  const no_sat = color.set("hsl.s", 0);
  const full_sat = color.set("hsl.s", 1);
  const scale_sat = chroma.scale([no_sat, color, full_sat]);

  // Update input with scaling gradients:
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

function hslControls(event) {
  const index =
    event.target.getAttribute("data-hue") ||
    event.target.getAttribute("data-bright") ||
    event.target.getAttribute("data-saturation");
  // console.log(index); // using data attribute in the `<input>`

  let sliders = event.target.parentElement.querySelectorAll(
    'input[type="range"]'
  );
  const [hue, brightness, saturation] = sliders;
  const colorDiv = initialColors[index];
  let color = chroma(colorDiv)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorContainer[index].style.backgroundColor = color;
}

function updateHexTitle(index) {
  const activeDiv = colorContainer[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const hexTitle = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  hexTitle.innerText = color.hex();
  checkContrast(color, hexTitle);
  for (let icon of icons) {
    checkContrast(color, icon);
  }
}

function sliderReset() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueInput = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueInput).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightInput = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightInput).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satInput = initialColors[slider.getAttribute("data-saturation")];
      const satValue = chroma(satInput).hsl()[1];
      slider.value = satValue;
    }
  });
}

function clipboardCopy(hex) {
  const placeholder = document.createElement("textarea");
  placeholder.value = hex.innerText;
  document.body.appendChild(placeholder);
  placeholder.select();
  // console.log(placeholder.value);
  document.execCommand("copy");
  document.body.removeChild(placeholder);
  // Popup animation:
  const popup = popupBox.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openSliderPanel(index) {
  sliderContainer[index].classList.toggle("active");
}
function closeSliderPanel(index) {
  sliderContainer[index].classList.remove("active");
}
function lockColor(event, index) {
  const lockIcon = event.target.children[0];
  const activeDiv = colorContainer[index];
  activeDiv.classList.toggle("locked");
  if (lockIcon.classList.contains("fa-lock-open")) {
    event.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    event.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// ! GLOBAL SELECTORS AND VARIABLES (FOR LOCAL STORAGE)
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSaveBtn = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-wrapper");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-wrapper");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// ! EVENT LISTENERS
saveBtn.addEventListener("click", openPalette);
closeSaveBtn.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

// ! FUNCTIONS
function openPalette() {
  const popupBox = saveContainer.children[0];
  saveContainer.classList.add("active");
  popupBox.classList.add("active");
}
function closePalette() {
  const popupBox = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popupBox.classList.remove("active");
}
function savePalette() {
  saveContainer.classList.remove("active");
  popupBox.classList.remove("active");
  let name = saveInput.value;
  let colors = [];
  hexTitles.forEach((hex) => colors.push(hex.innerText));
  // Generate the palette object:
  let paletteNr;
  const getPalettes = JSON.parse(localStorage.getItem("palettes"));
  if (getPalettes) {
    paletteNr = getPalettes.length;
  } else {
    paletteNr = savedPallettes.length;
  }
  const paletteObj = {
    name: name,
    colors: colors,
    number: paletteNr,
  };
  savedPallettes.push(paletteObj);
  console.log(savedPallettes);
  // Save to local storage:
  savetoLocal(paletteObj);
  saveInput.value = ""; // clear input

  // Generate palette within library modal:
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.number);
  paletteBtn.innerText = "Select";
  // Attach event listener to button:
  paletteBtn.addEventListener("click", (event) => {
    const index = event.target.classList[1];
    initialColors = []; // reset to selection
    savedPallettes[index].colors.forEach((color, index) => {
      initialColors.push(color);
      colorContainer[index].style.backgroundColor = color;
      const text = colorContainer[index].children[0];
      checkContrast(color, text);
      updateHexTitle(index);
    });
    sliderReset();
  });
  // Append elements to palette element:
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  // Finally append palette into library modal:
  libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj) {
  let localPalettes; // placeholder
  // 1# Check if nothing has been defined yet and define an empty array.
  // Otherwise we can retrieve "getItem" it if already setup.
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  // 2# Then we can push incoming data into the placeholder.
  // That is then followed by a "setItem" into storage.
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popupBox = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popupBox.classList.add("active");
}
function closeLibrary() {
  const popupBox = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popupBox.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const getPalettes = JSON.parse(localStorage.getItem("palettes"));
    savedPallettes = [...getPalettes];
    getPalettes.forEach((paletteObj) => {
      // Generate palette within library modal:
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.number);
      paletteBtn.innerText = "Select";
      // Attach event listener to button:
      paletteBtn.addEventListener("click", (event) => {
        const index = event.target.classList[1];
        initialColors = []; // reset to selection
        getPalettes[index].colors.forEach((color, index) => {
          initialColors.push(color);
          colorContainer[index].style.backgroundColor = color;
          const text = colorContainer[index].children[0];
          checkContrast(color, text);
          updateHexTitle(index);
        });
        sliderReset();
      });
      // Append elements to palette element:
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);

      // Finally append palette into library modal:
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
// localStorage.clear();
