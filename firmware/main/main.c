#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

void app_main(void) {
    printf("Pericles firmware starting\n");
    vTaskDelay(pdMS_TO_TICKS(1000));
    printf("Ready\n");
}
