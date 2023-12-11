#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>
#include <Servo.h>

Servo servo_8;

void setup()
{
  servo_8.attach(8);

}


void loop()
{
  servo_8.write(0);
  delay(2000);
  servo_8.write(20);
  delay(2000);
  servo_8.write(40);

}