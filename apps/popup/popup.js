"use strict";

// '$1.3232$$$'.replace(/[^\d\.]+/g, '')

const NOTIFICATION_IDS = [];
const DEFAULT_TIMER = 500;
const TIMERS = [];

const playSound = () => {
  var audio = document.getElementById("play-sound");

  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "play-sound";
    document.body.appendChild(audio);
    audio.volume = 1;
    audio.src = "./audio/ringing.ogg";
  }

  audio.play();
  setTimeout(() => {
    audio.pause();
  }, 300);
};

const getValueFromTab = (info) => {
  return new Promise((resolve) => {
    const query = {
      url: `*://${info.origin}/*`,
    };

    chrome.tabs.query(query, (results) => {
      if (!results || results.length === 0) {
        resolve(null);
        return;
      }

      const tab = results.find((res) => res.id === info.tabid);

      if (!tab) {
        resolve(null);
        return;
      }

      try {
        chrome.tabs.sendRequest(
          tab.id,
          { element: info.element, method: "getText" },
          function (response) {
            if (response && response.method === "getText") {
              if (!response.data) {
                resolve(null);
                return;
              }

              var matches = response.data.match(/(\d+(\.\d+)?)/g);

              if (!matches) {
                resolve(null);
                return;
              }

              var text = matches[matches.length - 1].trim();
              resolve(text);
            }
          }
        );
      } catch (e) {
        console.error(e);
      }
    });
  });
};

$(document).ready(() => {
  $("#options").on("click", () => {
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL("popup.html#window"),
    // });
    const id = String(new Date().getTime());
    chrome.notifications.create(id, {
      title: "Ăn điểm rồi anh ei!!!!!",
      message: `1.2322 - 1.4232 (${id}%)`,
      iconUrl: "./styles/imgs/128.png",
      type: "basic",
      // requireInteraction: true,
      buttons: [
        {
          title: "Đóng",
        },
      ],
    });

    playSound();
  });

  const render = () => {
    $("#page-info").html(``);
    const data = JSON.parse(localStorage.getItem("data") || `[]`);

    if (data.length === 0) {
      $("#page-info").html("No data founds.");
    } else {
      data.forEach((item, index) => {
        var htmlItem = ``;

        if (item.items[0]) {
          htmlItem = `<div class="stats-page">
              <span>${item.items[0].origin}</span>
              <strong class="amount index-${index}-0">--</strong>
            </div>`;
        }

        if (item.items[1]) {
          htmlItem += `<div class="stats-page">
          <span>${item.items[1].origin}</span>
          <strong class="amount index-${index}-1">--</strong>
        </div>`;
        }

        const notification = item.settings.notification || false;
        const timer = item.settings.timer || 2000;
        const type = item.settings.type || "<";
        const threshold = item.settings.threshold || 1.4;

        var html = `<div class="setting-item">
            <div class="default-container" data-index="${index}">
              <h2>So sánh ${index + 1}</h2>
              <div class="actions">
                <button class="gear"></button>
                <button class="bell${notification ? " active" : ""}"></button>
                <button class="trash"></button>
              </div>
            </div>
            <div class="counter-panel card stats-${index}">
              <div class="stats">${htmlItem}</div>
              <div class="settings none">
                <div class="form-group">
                  <label class="control-label">Timer (ms)</label>
                  <input type="text" class="timer" value="${timer}" />
                </div>
                <div class="form-group">
                  <label class="control-label">Threshold (%)</label>
                  <select class="control-select">
                    <option value=">"${
                      type === ">" ? " selected" : ""
                    }>&gt;</option>
                    <option value="<"${
                      type === "<" ? " selected" : ""
                    }>&lt;</option>
                  </select>
                  <input type="text" class="threshold" value="${threshold}" />
                </div>
                <div class="form-group end">
                  <button type="button" class="btn btn-submit">Save</button>
                </div>
              </div>
            </div>
          </div>`;

        $("#page-info").append(html);
      });

      $(".trash").on("click", (e) => {
        const parent = $(e.target).parents(".default-container");
        const index = parent.attr("data-index");
        parent.parent().remove();
        // clear timeout
        if (TIMERS && TIMERS[index]) {
          clearTimeout(TIMERS[index]);
        }

        data.splice(index, 1);
        localStorage.setItem("data", JSON.stringify(data));
        render();
      });

      $(".bell").on("click", (e) => {
        const div = $(e.target).parents(".setting-item");
        const index = div.find(".default-container").attr("data-index");

        if (!index) {
          return;
        }

        const target = $(e.target);
        const settings = { notification: false };

        if (target.hasClass("active")) {
          target.removeClass("active");
          settings.notification = false;
        } else {
          target.addClass("active");
          settings.notification = true;
        }

        data[index].settings = { ...data[index].settings, ...settings };
        localStorage.setItem("data", JSON.stringify(data));
      });

      $(".gear").on("click", (e) => {
        const div = $(e.target).parents(".setting-item");
        const div2 = div.find(".settings");
        const isHidden = div2.hasClass("none");

        if (isHidden) {
          div2.removeClass("none");
          $(e.target).addClass("active");
        } else {
          div2.addClass("none");
          $(e.target).removeClass("active");
        }
      });

      $(".btn-submit").on("click", (e) => {
        const div = $(e.target).parents(".setting-item");
        const timer = div.find(".timer").val();
        const type = div.find(".control-select option:selected").val();
        const threshold = div.find(".threshold").val();
        const index = div.find(".default-container").attr("data-index");
        const settings = {
          timer: Number(timer),
          type: type,
          threshold: Number(threshold),
        };
        data[index].settings = { ...data[index].settings, ...settings };
        localStorage.setItem("data", JSON.stringify(data));
      });

      data.map((item, index) => {
        const callback = () => {
          const values = [];
          item.items.map((subItem, subIndex) => {
            getValueFromTab(subItem).then((value) => {
              if (!value) {
                $(`.index-${index}-${subIndex}`).html("--");
                return;
              }

              values.push(value);
              $(`.index-${index}-${subIndex}`).html(value);

              if (values.length === 2) {
                checkThreshold(values[0], values[1], item, index);
              }

              // set timeout
              if (item.items.length >= 1) {
                if (TIMERS[index]) {
                  clearTimeout(TIMERS[index]);
                }

                TIMERS[index] = setTimeout(
                  callback,
                  item.settings.timer || DEFAULT_TIMER
                );
              }
            });
          });
        };
        try {
          callback();
        } catch (e) {
          if (TIMERS[index]) {
            clearTimeout(TIMERS[index]);
          }
        }
      });
    }
  };

  render();

  const checkThreshold = (value1, value2, item, index) => {
    if (
      !/^(-)?\d+(\.\d+)?$/g.test(value1) ||
      !/^(-)?\d+(\.\d+)?$/g.test(value2)
    ) {
      console.warn(`${value1} hoặc ${value2} không phải là số.`);
      return;
    }

    value1 = Number(value1);
    value2 = Number(value2);
    var thresholdValue = 0;
    const settings = item.settings;
    const THRESHOLD = settings.threshold;
    const type = settings.swapType || ">";
    const notification = settings.notification;

    switch (type) {
      case ">":
        if (value1 > value2) {
          thresholdValue = ((value1 - value2) / value2) * 100;
        }
        break;
      case "<":
        if (value1 < value2) {
          thresholdValue = ((value2 - value1) / value1) * 100;
        }
        break;
    }

    if (notification && thresholdValue >= THRESHOLD) {
      const data = {
        title: `${item.items[0].origin} - ${item.items[1].origin}`,
        message: `${value1} - ${value2} (${thresholdValue.toFixed(2)}%)`,
        iconUrl: "./styles/imgs/128.png",
        type: `basic`,
        // requireInteraction: true,
        buttons: [
          {
            title: "Đóng",
          },
        ],
      };

      const NOTIFICATION_ID = `notification${index}`;
      if (NOTIFICATION_IDS.includes(NOTIFICATION_ID)) {
        chrome.notifications.update(NOTIFICATION_ID, data);
      } else {
        chrome.notifications.create(NOTIFICATION_ID, data);
        NOTIFICATION_IDS.push(NOTIFICATION_ID);
      }

      playSound();
    }
  };
});

chrome.notifications.onClosed.addListener((notificationId) => {
  const index = NOTIFICATION_IDS.indexOf(notificationId);
  if (index >= 0) {
    NOTIFICATION_IDS.splice(index, 1);
  }
});
