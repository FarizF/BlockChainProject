from GY152accgyro import GY152
from KY033proximity import KY033
from DHT22temphumidity import DHT22

from time import sleep
import asyncio
import threading
import tracemalloc

BASE_URL = "https://b0992b76.ngrok.io" #TODO Add automatic tunnel/IP resolving, or use fixed/configured domain
CONTAINER_ID = "" #TODO Add possibility to pass parameters to script at startup

tracemalloc.start()

class Main:

    gy152 = GY152()
    dht22 = DHT22()
    ky033 = KY033()

    async_tasks = []
    loop = asyncio.get_event_loop()

    def run(self):
        self.startRegisterLoop()
        
    def startRegisterLoop(self):
        while True:
            self.gy152.register(self, BASE_URL, CONTAINER_ID)
            self.dht22.register(self, BASE_URL, CONTAINER_ID)
            self.ky033.register(self, BASE_URL, CONTAINER_ID)
            print(str("Is running: " + str(self.loop.is_running())));
            self.startTaskLoop()

    # def stopRegisterLoop(self):

    def appendToTasks(self, task):
        self.async_tasks.append(task);

    def startTaskLoop(self):
        print(str(self.loop) + " " + str(len(self.async_tasks)))
        if self.loop.is_running() == False:
            self.loop.run_until_complete(asyncio.gather(*self.async_tasks))
            print("Running taskloop")
            self.async_tasks.clear()
        

if __name__ == "__main__":
    Main().run()