/* LED Wall

   Reads pixel data from usb as a list of bytes. Three bytes make RGB for a pixel.
   List represents pixels from left ->, top -> bottom

   @author mtownsend
   @since May 2018
*/

#include <OctoWS2811.h>

const int CONFIG = WS2811_GRB | WS2811_800kHz;
const int LEDS_PER_STRIP = 150;
const int ROWS = 30;
const int COLS = 40;
const int FRAME_SIZE = ROWS * COLS;
const uint8_t DARKEN = 1;
const uint8_t CLR_SIG[] = { 0x01, 0x00, 0x01 };
const int CLR_LEN = 3;

DMAMEM int displayMemory[LEDS_PER_STRIP * 6];
int drawingMemory[LEDS_PER_STRIP * 6];
OctoWS2811 leds(LEDS_PER_STRIP, displayMemory, drawingMemory, CONFIG);
uint32_t nextFrame[FRAME_SIZE];

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

void displayFrame() {
  for (int i = 0; i < FRAME_SIZE; i++) {
    leds.setPixel(convertIndex(i), nextFrame[i]);
  }
  leds.show();
}

void setup() {
  for (int i = 0; i < FRAME_SIZE; i++) {
    nextFrame[i] = 0x000033;
  }
  leds.begin();
  displayFrame();
  Serial.begin(9600); // USB is always 12 Mbit/sec
}

uint32_t currentColour = 0;
int bytesProcessed = 0;
int pixelIndex = 0;
int clrIndex = 0;
void loop()
{
  
  // Read from USB
  uint8_t incomingByte;
  if (Serial.available()) {

    incomingByte = Serial.read();
    if (CLR_SIG[clrIndex] == incomingByte) {
      if (++clrIndex >= CLR_LEN) {
        // Received the clear signal
        pixelIndex = 0;
        bytesProcessed = 0;
        clrIndex = 0;
        currentColour = 0;
        displayFrame();
        return;
      }
    }
    else if (clrIndex > 0) {
      clrIndex = 0;
    }

    // Pack the byte into the current 24-bit colour int
    currentColour = (currentColour << 8) + (incomingByte * DARKEN);

    if (++bytesProcessed >= 3) {
      // We've processed a full RGB colour, so set the led
      if (pixelIndex < FRAME_SIZE) {
        nextFrame[pixelIndex++] = currentColour;
      }
      currentColour = 0;
      bytesProcessed = 0;
    }
  }
}

