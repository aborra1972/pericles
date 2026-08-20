#include "pericles_core.h"
#include <string.h>

void debounce_init(debounce_state_t *state, uint32_t debounce_ms) {
    state->debounce_ms = debounce_ms;
    state->last_change_time = 0;
    state->last_state = false;
    state->stable_state = false;
    state->current_time = 0;
}

bool debounce_check(debounce_state_t *state, bool raw_input) {
    if (raw_input != state->last_state) {
        state->last_change_time = state->current_time;
        state->last_state = raw_input;
    }

    if ((state->current_time - state->last_change_time) >= state->debounce_ms) {
        if (raw_input != state->stable_state) {
            state->stable_state = raw_input;
            return true;
        }
    }

    return false;
}

void debounce_advance_time(debounce_state_t *state, uint32_t ms) {
    state->current_time += ms;
}
