import Adafruit_DHT
import calendar
import time
import requests
import asyncio

class DHT22:
    async def postEvents(self, baseurl, containerId, sensordata):
        requests.post(baseurl + "/rest/container-event", json={
            'containerId' : containerId,
            'timestamp' : str(calendar.timegm(time.gmtime())),
            'sensorDataType' : 'humid',
            'measuredVal' : str(sensordata['humid'])
        })

    def register(self, main, baseurl, containerId):
        DHT_SENSOR = Adafruit_DHT.DHT11
        DHT_PIN = 4

        humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
        print(humidity, temperature)

        if humidity is not None and temperature is not None:
            print("Temp={0:0.1f}*C  Humidity={1:0.1f}%".format(temperature, humidity))
        else:
            print("Failed to retrieve data from humidity sensor")

        sensordata = { "humid" : humidity, "temp" : temperature }

        main.appendToTasks(self.postEvents(baseurl, containerId, sensordata))