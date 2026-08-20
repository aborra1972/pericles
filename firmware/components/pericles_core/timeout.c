#include "pericles_core.h"

void timeout_init(timeout_state_t *timeout, uint32_t timeout_ms) {
    timeout->timeout_ms = timeout_ms;
    timeout->start_time = 0;
    timeout->running = false;
    timeout->current_time = 0;
}

void timeout_start(timeout_state_t *timeout) {
    timeout->start_time = timeout->current_time;
    timeout->running = true;
}

void timeout_stop(timeout_state_t *timeout) {
    timeout->running = false;
}

void timeout_reset(timeout_state_t *timeout) {
    timeout->start_time = timeout->current_time;
}

void timeout_advance(timeout_state_t *timeout, uint32_t ms) {
    timeout->current_time += ms;
}

bool timeout_expired(timeout_state_t *timeout) {
    if (!timeout->running) {
        return false;
    }
    return (timeout->current_time - timeout->start_time) >= timeout->timeout_ms;
}
