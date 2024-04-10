let submitBtn = document.getElementById("submit");

submitBtn.addEventListener("click", function (event) {
  event.preventDefault();
  var temperature = Number(document.getElementById("temperature").value);
  var humidity = Number(document.getElementById("humidity").value);
  var heatIndex = Number(document.getElementById("heatIndex").value);
  var smoke = Number(document.getElementById("smoke").value);
  var password = document.getElementById("password").value;
  var accepted = document.getElementById("accepted").checked;

  if (isNaN(temperature) || temperature === 0)
    alert("Invalid temperature threshold");
  else if (isNaN(humidity) || humidity === 0)
    alert("Invalid humidity threshold");
  else if (isNaN(heatIndex) || heatIndex === 0)
    alert("Invalid heat index threshold");
  else if (isNaN(smoke) || smoke === 0) alert("Invalid smoke threshold");
  else if (!accepted) alert("Please accept the terms and conditions");
  else {
    //   start an async GET request to push this data to thingspeak server
    fetch(
      `https://api.thingspeak.com/update?api_key=DMUU4N34U556W1W1&field1=${temperature}&field2=${heatIndex}&field3=${humidity}&field4=${smoke}&field5=${password}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data === 0) alert("Error sending data");
        else {
            alert("Data sent successfully");
            window.location.href = "index.html";
        }
      })
      .catch((error) => {
        alert("Error sending data", error);
      });
  }
});
