import RPi.GPIO as GPIO
import time
import sys
import os

#assign servo pins
servoPin = 12


#Servo setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(servoPin,GPIO.OUT)
GPIO.setwarnings(False)

#setting initial state of servo motor
p = GPIO.PWM(servoPin,50)
p.start(7.5)


try:
        
    p.ChangeDutyCycle(12.5)
    time.sleep(1)
                           
        
except KeyboardInterrupt:
    GPIO.cleanup()
    
GPIO.cleanup()
sys.exit()
os.system('kill $(ps aux | grep python closegarage.py | awk ' + '{ print $2 }' + ')')
