#include<stdio.h>
#include<wiringPi.h>
#define GAS_PIN 19
int main(void)
{
wiringPiSetupGpio();
pinMode(GAS_PIN,INPUT);

while(1)
{
if(digitalRead(GAS_PIN)==LOW)
{
printf("GAS  detected");
printf("\n");
}
else
{
printf("Cool Enviroment");
printf("\n");
}
delay(2000);
}
return 0;
             }