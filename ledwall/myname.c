#include "usb_names.h"

#define PRODUCT_NAME    {'M','e','t','a','M','I','D','I'}
#define PRODUCT_NAME_LEN  8

struct usb_string_descriptor_struct usb_string_product_name = {
  2 + PRODUCT_NAME_LEN * 2,
  3,
  PRODUCT_NAME
};
