function Fiery() {
  $(function () {
    fetch(
      "https://api.thingspeak.com/channels/2496994/feeds.json?api_key=Q0IBL8TDUSM1AZSM&results=1"
    )
      .then((response) => response.json())
      .then((init_data) => {
        fetch(
          `https://api.thingspeak.com/channels/2496994/feeds.json?api_key=Q0IBL8TDUSM1AZSM&results=${init_data.channel.last_entry_id}`
        )
          .then((response) => response.json())
          .then((data) => {
            var fetched_data = data.feeds;

            // =====================================
            // Temperature
            // =====================================
            var temperature = {
              chart: {
                id: "sparkline3",
                type: "area",
                height: 60,
                sparkline: {
                  enabled: true,
                },
                group: "sparklines",
                fontFamily: "Plus Jakarta Sans', sans-serif",
                foreColor: "#adb0bb",
              },
              series: [
                {
                  name: "Temperature",
                  color: "#FFA500", // change color to orange
                  data: fetched_data.slice(-100).map((item) => item.field1),
                },
              ],
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                colors: ["#f3feff"],
                type: "solid",
                opacity: 0.05,
              },

              markers: {
                size: 0,
              },
              tooltip: {
                theme: "dark",
                fixed: {
                  enabled: true,
                  position: "right",
                },
                x: {
                  show: false,
                },
              },
            };
            new ApexCharts(
              document.querySelector("#temperature"),
              temperature
            ).render();
            document.querySelector("#curTemperature").textContent =
              parseFloat(fetched_data[fetched_data.length - 1].field1).toFixed(
                1
              ) + " °C";

            // =====================================
            // Heat Index
            // =====================================
            var heatIndex = {
              chart: {
                id: "sparkline2",
                type: "area",
                height: 60,
                sparkline: {
                  enabled: true,
                },
                group: "sparklines",
                fontFamily: "Plus Jakarta Sans', sans-serif",
                foreColor: "#adb0bb",
              },
              series: [
                {
                  name: "Heat Index",
                  color: "#FF5D87",
                  data: fetched_data.slice(-100).map((item) => item.field2),
                },
              ],
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                colors: ["#ffeff6"],
                type: "solid",
                opacity: 0.05,
              },

              markers: {
                size: 0,
              },
              tooltip: {
                theme: "dark",
                fixed: {
                  enabled: true,
                  position: "right",
                },
                x: {
                  show: false,
                },
              },
            };
            new ApexCharts(
              document.querySelector("#heatIndex"),
              heatIndex
            ).render();
            document.querySelector("#curHeatIndex").textContent =
              parseFloat(fetched_data[fetched_data.length - 1].field2).toFixed(
                1
              ) + " °C";

            // =====================================
            // Humidity
            // =====================================
            var humidity = {
              chart: {
                id: "sparkline4",
                type: "area",
                height: 60,
                sparkline: {
                  enabled: true,
                },
                group: "sparklines",
                fontFamily: "Plus Jakarta Sans', sans-serif",
                foreColor: "#adb0bb",
              },
              series: [
                {
                  name: "Humidity",
                  color: "#6699ee",
                  data: fetched_data.slice(-100).map((item) => item.field3),
                },
              ],
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                colors: ["#f3feff"],
                type: "solid",
                opacity: 0.05,
              },

              markers: {
                size: 0,
              },
              tooltip: {
                theme: "dark",
                fixed: {
                  enabled: true,
                  position: "right",
                },
                x: {
                  show: false,
                },
              },
            };
            new ApexCharts(
              document.querySelector("#humidity"),
              humidity
            ).render();
            document.querySelector("#curHumidity").textContent =
              parseFloat(fetched_data[fetched_data.length - 1].field3).toFixed(
                1
              ) + " %";

            // =====================================
            // Smoke
            // =====================================
            var smoke = {
              chart: {
                id: "sparkline1",
                type: "area",
                height: 60,
                sparkline: {
                  enabled: true,
                },
                group: "sparklines",
                fontFamily: "Plus Jakarta Sans', sans-serif",
                foreColor: "#adb0bb",
              },
              series: [
                {
                  name: "Smoke",
                  color: "#29E7CD",
                  data: fetched_data.slice(-100).map((item) => item.field5),
                },
              ],
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                colors: ["#ffeff6"],
                type: "solid",
                opacity: 0.05,
              },

              markers: {
                size: 0,
              },
              tooltip: {
                theme: "dark",
                fixed: {
                  enabled: true,
                  position: "right",
                },
                x: {
                  show: false,
                },
              },
            };
            new ApexCharts(document.querySelector("#smoke"), smoke).render();
            document.querySelector("#curSmoke").textContent =
              parseFloat(fetched_data[fetched_data.length - 1].field5).toFixed(
                1
              ) + " PPM";

            // =====================================
            // Alerts
            // =====================================
            document.getElementById("startup").innerHTML = `<div>${
              fetched_data[0].created_at.split("T")[0]
            }</div>
        <div style="padding-bottom: 5vh;">${
          fetched_data[0].created_at.split("T")[1].replace("Z", "") + " UTC"
        }</div>`;

            var lastAlert = document.getElementById("lastAlert");
            for (var i = fetched_data.length - 1; i >= 0; i--) {
              if (fetched_data[i].field6 === "1") {
                var li = document.createElement("li");
                li.className =
                  "timeline-item d-flex position-relative overflow-hidden";

                var div1 = document.createElement("div");
                div1.className = "timeline-time text-dark flex-shrink-0 text-end";
                var date = document.createElement("div");
                date.textContent = fetched_data[i].created_at.split("T")[0];
                div1.appendChild(date);
                var time = document.createElement("div");
                time.textContent =
                  fetched_data[i].created_at.split("T")[1].replace("Z", "") +
                  " UTC";
                div1.appendChild(time);

                var div2 = document.createElement("div");
                div2.className =
                  "timeline-badge-wrap d-flex flex-column align-items-center";

                var span1 = document.createElement("span");
                span1.className =
                  "timeline-badge border-2 border border-danger flex-shrink-0 my-8";

                var span2 = document.createElement("span");
                span2.className = "timeline-badge-border d-block flex-shrink-0";

                div2.appendChild(span1);
                div2.appendChild(span2);

                var div3 = document.createElement("div");
                div3.className = "timeline-desc fs-3 text-dark mt-n1 fw-semibold";
                div3.textContent = "Fire Detected! ";

                var smoke_details = document.createElement("span");
                smoke_details.className = "text-primary d-block fw-normal";
                smoke_details.textContent = `Temperature: ${fetched_data[i].field1} °C`;
                div3.appendChild(smoke_details);
                var smoke_details = document.createElement("span");
                smoke_details.className = "text-primary d-block fw-normal";
                smoke_details.textContent = `Humidity: ${fetched_data[i].field3} %`;
                div3.appendChild(smoke_details);
                var smoke_details = document.createElement("span");
                smoke_details.className = "text-primary d-block fw-normal";
                smoke_details.textContent = `Heat Index: ${fetched_data[i].field2} °C`;
                div3.appendChild(smoke_details);
                var smoke_details = document.createElement("span");
                smoke_details.className = "text-primary d-block fw-normal";
                smoke_details.textContent = `Smoke: ${fetched_data[i].field5} PPM`;
                div3.appendChild(smoke_details);

                li.appendChild(div1);
                li.appendChild(div2);
                li.appendChild(div3);

                lastAlert.parentNode.insertBefore(li, lastAlert);
              }
            }

            // Check for fire, to raise alert on the webPage
            if (fetched_data[fetched_data.length - 1]["field6"] === "1") {
              document.getElementById("fireAlert").style.backgroundColor = "rgb(168, 34, 50)";
              document.getElementById("fireAlert").style.borderRadius = "13px";
              
              document.getElementById("alertText").innerHTML = "Fire Detected!";
              document.getElementById("alertText").style.color = "white";

              document.getElementById("alertLogo").src = "../assets/images/logos/favicon.png";
            }
            else {
              document.getElementById("fireAlert").style.backgroundColor = "white";
              document.getElementById("fireAlert").style.borderRadius = "13px";
              
              document.getElementById("alertText").innerHTML = "All Good!";
              document.getElementById("fireAlert").style.color = "black";

              document.getElementById("alertLogo").src = "../assets/images/logos/checkmark.png";
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
  });
}

Fiery();
setInterval(Fiery, 15000);
