/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @author longnt@hotmail.com.vn
 */

const CONTEXT_MENU_ID = "MY_CONTEXT_MENU";

function createContextMenu() {
  chrome.contextMenus.create({
    title: "Select Element",
    contexts: ["page"],
    id: CONTEXT_MENU_ID,
    onclick: (info, tab) => {
      chrome.tabs.sendMessage(tab.id, "select-element", {
        frameId: info.frameId,
      });
    },
  });
}

chrome.runtime.onInstalled.addListener(function () {
  // clear data
  localStorage.removeItem("data");
  createContextMenu();
});

chrome.runtime.onMessage.addListener((request, sender) => {
  switch (request.action) {
    case "select-element":
      var data = JSON.parse(localStorage.getItem("data") || `[]`);
      var _index = -1;
      data.forEach((item, index) => {
        if (item.items.length === 1) {
          _index = index;
        }
      });

      if (_index >= 0) {
        data[_index].items.push({
          url: sender.tab.url,
          origin: sender.origin.replace(/(https\:\/\/|http\:\/\/)/g, ""),
          tabid: sender.tab.id,
          element: request.data,
        });
      } else {
        data.push({
          settings: {
            notification: true,
            timer: 500, // 0.5s,
            type: ">",
            threshold: 1,
          },
          items: [
            {
              url: sender.tab.url,
              origin: sender.origin.replace(/(https\:\/\/|http\:\/\/)/g, ""),
              tabid: sender.tab.id,
              element: request.data,
            },
          ],
        });
      }

      localStorage.setItem("data", JSON.stringify(data));
      break;
  }
});
