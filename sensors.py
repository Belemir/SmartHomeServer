import RPi.GPIO as GPIO
import time
import sys
import DHT11_Python.dht11 as dht11 

#sensor pins
servoPin = 12
#servoRun = False
lightSensorPin = 27
rainPin = 17
motionPin = 18
gasPin = 19


#GPIO setup
GPIO.setmode(GPIO.BCM)
#GPIO.setup(servoPin,GPIO.OUT)
GPIO.setup(lightSensorPin, GPIO.IN)
GPIO.setup(rainPin, GPIO.IN)
GPIO.setup(motionPin, GPIO.IN)
GPIO.setup(gasPin, GPIO.IN)
GPIO.setwarnings(False)

#setting initial state of servo motor
#p = GPIO.PWM(servoPin,50)
#p.start(7.5)

#reading Heat and Humidity sensor from pin 4
instance = dht11.DHT11(pin=4)
 
try:
        while True:

                #Light Detection
                if GPIO.input(lightSensorPin) == 0:
                        print "Light Detected"
                        
                else:
                        print "Light NOT Detected"
                        

                #Raindrop Detection
                if GPIO.input(rainPin) == 0:
                        print "Rain Detected"
                        
                else:
                        print "Rain NOT Detected"

                #Gas Detection
                if GPIO.input(gasPin) == 0:
                        print "Gas Detected"
                else:
                        print "Gas NOT Detected"

                #Motion Detection
                if GPIO.input(motionPin) == 0:
                        print "Motion NOT Detected"
                else:
                        print "Motion Detected"

                #Displaying Heat and Humidity data
                result = instance.read()
                if result.is_valid():
                        print("Temperature: %d C" % result.temperature + " Humidity: %d %%" % result.humidity)
                       
                        
        
except KeyboardInterrupt:
        GPIO.cleanup()

#playing with servo
#if servoRun:
                        
        #p.ChangeDutyCycle(7.5)
        #time.sleep(1)
        #p.ChangeDutyCycle(12.5)
        #time.sleep(1)
        #p.ChangeDutyCycle(2.5)
        #time.sleep(1)


