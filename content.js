/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author longnt@hotmail.com.vn
 */

"use strict";

// insert css
["styles/css/detector.css"].forEach((file) => Utils.insertCss(file));

let INITIALIZED = false;
const DETECTOR_CLASS_NAME = "detector-element-tmp";

const handleMouseMove = (evt) => {
  if (evt && "target" in evt) {
    const target = evt.target;
    target.classList.add(DETECTOR_CLASS_NAME);
    target.addEventListener("mouseout", () => {
      target.classList.remove(DETECTOR_CLASS_NAME);
    });
  }
};
const handleSelectElement = (evt) => {
  if ("target" in evt) {
    evt.target.classList.remove(DETECTOR_CLASS_NAME);
  }
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("click", handleSelectElement);
  chrome.runtime.sendMessage({
    action: "select-element",
    data: Utils.getCssPath(evt.target),
  });
  INITIALIZED = false;
};

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  if (request.method == "getText") {
    sendResponse({
      data: document.querySelector(request.element).innerText,
      method: "getText",
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request) {
    case "select-element":
      if (INITIALIZED) return;

      document.addEventListener("mousemove", handleMouseMove);
      INITIALIZED = true;
      document.addEventListener("click", handleSelectElement);
      break;
  }
});
