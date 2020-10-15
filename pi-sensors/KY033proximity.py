import RPi.GPIO as GPIO
import calendar
import time
import requests
import asyncio

class KY033:
    async def postEvents(self, baseurl, containerId, sensordata):
        requests.post(baseurl + "/rest/container-event", json={
            'containerId' : containerId,
            'timestamp' : str(calendar.timegm(time.gmtime())),
            'sensorDataType' : 'humid',
            'measuredVal' : str(sensordata['doorclosed'])
        })

    def register(self, main, baseurl, containerId):
        GPIO.setmode(GPIO.BCM)
        
        # Declaration of the input pin which is connected with the sensor
        GPIO_PIN = 22
        GPIO.setup(GPIO_PIN, GPIO.IN, pull_up_down = GPIO.PUD_UP)
        
        print("Sensor-Test [press ctrl+c to end]")
        
        # main program loop
        try:
            if GPIO.input(GPIO_PIN) == True:
                print("LineTracker is on the line")
            else:
                print("Linetracker is not on the line")
            print("---------------------------------------")
        
        # Scavenging work after the end of the program
        except KeyboardInterrupt:
                GPIO.cleanup()
        
        sensordata = { "doorclosed" :  GPIO.input(GPIO_PIN)}

        main.appendToTasks(self.postEvents(baseurl, containerId, sensordata))