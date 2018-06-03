/* LED Wall
 *  
 * Reads pixel data from usb as a list of bytes. Three bytes make RGB for a pixel.
 * List represents pixels from left ->, top -> bottom
 * 
 * @author mtownsend
 * @since May 2018
 */

#include <OctoWS2811.h>

const int CONFIG = WS2811_GRB | WS2811_800kHz;
const int LEDS_PER_STRIP = 150;
const int ROWS = 30;
const int COLS = 40;
const uint8_t DARKEN = 2;

DMAMEM int displayMemory[LEDS_PER_STRIP * 6];
int drawingMemory[LEDS_PER_STRIP * 6];
OctoWS2811 leds(LEDS_PER_STRIP, displayMemory, drawingMemory, CONFIG);

// Input is indexed from left -> right, top -> bottom
// Actual LEDs are indexed starting in the bottom-left, going up then down
int convertIndex(int index) {
  int row = index / COLS;
  int col = index % COLS;
  boolean flip = (col / 5) % 2 > 0;
  if ((col % 2 == 0) != flip) {
    return ROWS - 1 - row + (col * ROWS);
  }
  return row + (col * ROWS);
}

void setup() {
  leds.begin();
  leds.setPixel(0, 0xFF0000);
  leds.show();
  Serial.begin(9600); // USB is always 12 Mbit/sec
}

uint8_t readColour() {
  return Serial.read() / DARKEN;
}

uint8_t red = 0;
uint8_t green = 0;
uint8_t blue = 0;
uint32_t currentColour = 0;
int bytesProcessed = 0;
int pixelIndex = 0;
void loop()
{
  // Read from USB
  uint8_t incomingByte;
  if (Serial.available()) {
    
    // Read the next byte (R, G, or B)
//    switch (bytesProcessed) {
//      case 0:
//        red = readColour();
//        break;
//      case 1:
//        green = readColour();
//        break;
//      case 2:
//        blue = readColour();
//        break;
//    }
    
    incomingByte = readColour();

    // Pack the byte into the current 24-bit colour int
    currentColour = (currentColour << 8) + incomingByte;

    if (++bytesProcessed >= 3) {
      // We've processed a full RGB colour, so set the led
      leds.setPixel(convertIndex(pixelIndex++), currentColour);
      red = 0;
      green = 0;
      blue = 0;
      currentColour = 0;
      bytesProcessed = 0;
    }

    if (pixelIndex >= leds.numPixels()) {
      // We've set a full frame worth of leds, so show it
      leds.show();
      pixelIndex = 0;
    }
  }
}

