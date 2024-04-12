#include <DHT.h>
#include <WiFi.h>
#include <ThingSpeak.h>
#include <ArduinoJson.h>

// TODO: replace placeholders with actual values
#define THRESHOLD_PASS "THRESHOLD_PASS"

// TODO: replace placeholders with actual values
#define WiFi_SSID "SSID"
#define WiFi_PASS "PASSWORD"

#define SMOKE_SEN_DIGITAL_PIN 2
#define SMOKE_SEN_ANALOG_PIN 35

#define DHTPIN 23
#define DHTTYPE DHT11

#define BUZZER_PIN 22

#define LED_R 21
#define LED_G 19
#define LED_B 18

DHT dht(DHTPIN, DHTTYPE);

WiFiClient client;

// TODO: replace placeholders with actual values
unsigned long dataChannelNumber = 123456789;
const char *dataWriteAPIKey = "WRITE_API_KEY";

// TODO: replace placeholders with actual values
unsigned long thresholdChannelNumber = 123456789;
const char *thresholdReadAPIKey = "READ_API_KEY";

void success()
{
    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, i);
        analogWrite(LED_G, 255 - i);
        analogWrite(LED_B, 255 - i);
        delay(5);
    }

    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, 255 - i);
        analogWrite(LED_G, i);
        analogWrite(LED_B, 255 - i);
        delay(5);
    }

    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, 255 - i);
        analogWrite(LED_G, 255 - i);
        analogWrite(LED_B, i);
        delay(5);
    }

    analogWrite(LED_R, 0);
    analogWrite(LED_G, 0);
    analogWrite(LED_B, 0);
}

void connectingToNetwork()
{
    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, i);
        analogWrite(LED_G, i);
        analogWrite(LED_B, 0);
        delay(5);
    }
}

void connectedToNetwork()
{
    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, 255 - i);
        analogWrite(LED_G, 255 - i);
        analogWrite(LED_B, 0);
        delay(5);
    }
}

void error()
{
    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, i);
        analogWrite(LED_G, min(0, 200 - i));
        analogWrite(LED_B, min(0, 200 - i));
        delay(5);
    }
}

void initializePins()
{
    pinMode(SMOKE_SEN_DIGITAL_PIN, INPUT);
    pinMode(SMOKE_SEN_ANALOG_PIN, INPUT);

    pinMode(DHTPIN, INPUT);

    pinMode(BUZZER_PIN, OUTPUT);

    pinMode(LED_R, OUTPUT);
    pinMode(LED_G, OUTPUT);
    pinMode(LED_B, OUTPUT);

    digitalWrite(LED_R, LOW);
    digitalWrite(LED_G, LOW);
    digitalWrite(LED_B, LOW);

    digitalWrite(BUZZER_PIN, HIGH);
}

void connectToNetwork()
{
    if (WiFi.status() == WL_CONNECTED)
        return;
    connectingToNetwork();
    WiFi.begin(WiFi_SSID, WiFi_PASS);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    connectedToNetwork();
}

void thingspeakError()
{
    for (int i = 0; i < 256; i++)
    {
        analogWrite(LED_R, i);
        analogWrite(LED_G, i / 2);
        analogWrite(LED_B, 0);
        delay(5);
    }
}

void setup()
{
    initializePins();

    Serial.begin(115200);
    dht.begin();

    connectToNetwork();

    ThingSpeak.begin(client);

    delay(2000);
}

int previousHumidityReading = -1;

// Initialize the threshold values
float temperatureThreshold = 50;
float heatIndexThreshold = 55;
int humidityChangeThreshold = 20;
int smokeAnalogThreshold = 1000;

void loop()
{
    connectToNetwork();

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float f = dht.readTemperature(true);

    if (isnan(h) || isnan(t) || isnan(f))
    {
        Serial.println("Failed to read from DHT sensor!");
        error();
    }
    else
    {

        float hif = dht.computeHeatIndex(f, h);
        float hic = dht.computeHeatIndex(t, h, false);

        Serial.print("Humidity: ");
        Serial.print(h);
        Serial.print(" %\t");
        Serial.print("Temperature: ");
        Serial.print(t);
        Serial.print(" *C ");
        Serial.print(f);
        Serial.print(" *F\t");
        Serial.print("Heat index: ");
        Serial.print(hic);
        Serial.print(" *C ");
        Serial.print(hif);
        Serial.println(" *F");

        int smokeDigital = digitalRead(SMOKE_SEN_DIGITAL_PIN);
        int smokeAnalog = analogRead(SMOKE_SEN_ANALOG_PIN);

        Serial.print("Smoke Digital: ");
        Serial.print(smokeDigital);
        Serial.print("\t");
        Serial.print("Smoke Analog: ");
        Serial.println(smokeAnalog);

        // fetch the thresholds from thingspeak server
        int numDataPoints = ThingSpeak.readMultipleFields(thresholdChannelNumber, thresholdReadAPIKey);
        if (numDataPoints > 0)
        {
            std::string result = ThingSpeak.readStringField(thresholdChannelNumber, 5, thresholdReadAPIKey).c_str();
            std::string expected = THRESHOLD_PASS;

            if (result == expected)
            {
                temperatureThreshold = ThingSpeak.readStringField(thresholdChannelNumber, 1, thresholdReadAPIKey).toFloat();
                heatIndexThreshold = ThingSpeak.readStringField(thresholdChannelNumber, 2, thresholdReadAPIKey).toFloat();
                humidityChangeThreshold = ThingSpeak.readStringField(thresholdChannelNumber, 3, thresholdReadAPIKey).toInt();
                smokeAnalogThreshold = ThingSpeak.readStringField(thresholdChannelNumber, 4, thresholdReadAPIKey).toInt();
            }
            else
                Serial.println("Invalid threshold password");
        }
        else
        {
            Serial.print(numDataPoints);
            Serial.print("\t");
            Serial.println("Error reading ThingSpeak channel");
        }

        ThingSpeak.setField(1, t);
        ThingSpeak.setField(2, hic);
        ThingSpeak.setField(3, h);
        ThingSpeak.setField(4, smokeDigital);
        ThingSpeak.setField(5, smokeAnalog);

        if (t > temperatureThreshold ||
            hic > heatIndexThreshold ||
            (previousHumidityReading != -1 &&
             abs(previousHumidityReading - h) > humidityChangeThreshold) ||
            smokeAnalog > smokeAnalogThreshold)
        {
            digitalWrite(BUZZER_PIN, LOW);
            ThingSpeak.setField(6, 1);
        }
        else
        {
            digitalWrite(BUZZER_PIN, HIGH);
            ThingSpeak.setField(6, 0);
        }

        previousHumidityReading = h;

        int code = ThingSpeak.writeFields(dataChannelNumber, dataWriteAPIKey);
        if (code == 200)
        {
            Serial.println("Channel update successful.");
            success();
        }
        else
        {
            Serial.println("Problem updating channel. HTTP error code " + String(code));
            thingspeakError();
        }
    }

    delay(30000);
}
