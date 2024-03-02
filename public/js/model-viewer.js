// let id = window.location.href.split('/').reverse()[0];
// console.log(id)


const model_viewer = document.getElementById("model-viewer");
const modelUrl =
  "https://cdn.glitch.global/3305a40c-4fb7-49c5-ba5c-4c7d81baf915/sofa2.glb?v=1700223607133";
model_viewer.src = modelUrl;

// Define an array of the model URLs
const modelUrls = [
  "https://cdn.glitch.global/3305a40c-4fb7-49c5-ba5c-4c7d81baf915/sofa2.glb?v=1700223607133",
  "https://cdn.glitch.me/3305a40c-4fb7-49c5-ba5c-4c7d81baf915/sofa1.glb?v=1702545778976",
  "https://cdn.glitch.global/3305a40c-4fb7-49c5-ba5c-4c7d81baf915/sofa3.glb?v=1700224656829",
  "https://cdn.glitch.me/3305a40c-4fb7-49c5-ba5c-4c7d81baf915/sofa4.glb?v=1702547169620",
];

// HANDLE AR COMPACTIBILITY
document
  .querySelector("#model-viewer")
  .addEventListener("ar-status", (event) => {
    if (event.detail.status === "failed") {
      const error = document.querySelector("#error");
      error.classList.remove("hide");
      error.addEventListener("transitionend", (event) => {
        error.classList.add("hide");
      });
    }
  });
// HANDLE PLACMENT CHANGES
function onSwitchPlacement(radBtn) {
  model_viewer.setAttribute("ar-placement", radBtn.value);
}

// SELECT ALL MATERIAL SWITCH BUTTONS
const materialBtns = document.querySelectorAll(".slide");
// ON MATERIAL CHANGE
function changeMaterial(selectedBtn, value) {
  console.log(value);
  materialBtns.forEach((btn) => btn.classList.remove("selected"));
  selectedBtn.classList.add("selected");

  // change the model URL
  model_viewer.src = modelUrls[value - 1];
}
