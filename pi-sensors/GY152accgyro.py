#!/usr/bin/env python
"""Released under the MIT License
Copyright 2015, 2016 MrTijn/Tijndagamer

Edited as per requirements by: Fariz Fakkel/FarizF
"""

from mpu6050 import mpu6050
import calendar
import time
import requests
import asyncio

sensor = mpu6050(0x68)

class GY152:

    loop = asyncio.get_event_loop()

    print("Loop running: " + str(loop.is_running()))

    async def postEvents(self, baseurl, containerId, sensordata):
        requests.post(baseurl + "/rest/container-event", json={
            'containerId' : containerId,
            'timestamp' : str(calendar.timegm(time.gmtime())),
            'sensorDataType' : 'temp',
            'measuredVal' : str(sensordata['temp'])
        })

    def register(self, main, baseurl, containerId):
        sensordata = {
            'accel_data' : sensor.get_accel_data(),
            'gyro_data' : sensor.get_gyro_data(),
            'temp' : sensor.get_temp()
        }

        print("Accelerometer data")
        print("x: " + str(sensordata['accel_data']['x']))
        print("y: " + str(sensordata['accel_data']['y']))
        print("z: " + str(sensordata['accel_data']['z']))

        print("Gyroscope data")
        print("x: " + str(sensordata['gyro_data']['x']))
        print("y: " + str(sensordata['gyro_data']['y']))
        print("z: " + str(sensordata['gyro_data']['z']))

        print("Temp: " + str(sensordata['temp']) + " C")

        main.appendToTasks(self.postEvents(baseurl, containerId, sensordata)), main.loop
