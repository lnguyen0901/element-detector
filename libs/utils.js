/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author longnt@hotmail.com.vn
 */

"use strict";

const textLimit = (str, limit) => {
  if (!str) {
    return "";
  }

  if (str.length <= limit) {
    return str;
  }

  return str.substr(0, limit) + "...";
};

const numberFormat = (
  number,
  lengthDecimal,
  sectionDelimiter,
  decimalDelimiter
) => {
  const regex =
    "\\d(?=(\\d{" + 3 + "})+" + (lengthDecimal > 0 ? "\\D" : "$") + ")";
  let num = number.toFixed(Math.max(0, ~~lengthDecimal));
  return (decimalDelimiter ? num.replace(".", decimalDelimiter) : num).replace(
    new RegExp(regex, "g"),
    "$&" + (sectionDelimiter || ",")
  );
};

const getCssPath = (el) => {
  if (!(el instanceof Element)) return;
  var path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    var selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
      path.unshift(selector);
      break;
    } else {
      var sib = el,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
};

const insertJs = (js, isModule = false) => {
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");

  if (isModule) {
    script.setAttribute("type", "module");
  }

  script.setAttribute("src", chrome.extension.getURL(js));

  const head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;

  head.insertBefore(script, head.lastChild);
};

const insertCss = (css) => {
  const head = document.getElementsByTagName("head")[0];
  const link = document.createElement("link");

  link.setAttribute("type", "text/css");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", chrome.runtime.getURL(css));

  head.appendChild(link);
};

var Utils = {
  insertCss: insertCss,
  insertJs: insertJs,
  getCssPath: getCssPath,
  textLimit: textLimit,
  numberFormat: numberFormat,
};
