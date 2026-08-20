#include "pericles_core.h"
#include <string.h>

static uint32_t next_session_id = 1;

void session_init(session_state_t *session) {
    session->state = SESSION_IDLE;
    session->session_id = 0;
}

void session_on_action_button(session_state_t *session) {
    switch (session->state) {
        case SESSION_IDLE:
            session->state = SESSION_LISTENING;
            session->session_id = next_session_id++;
            break;
        case SESSION_LISTENING:
            session->state = SESSION_IDLE;
            break;
        case SESSION_SPEAKING:
            // Ignore button during speaking
            break;
        case SESSION_THINKING:
            // Ignore button during thinking
            break;
    }
}

void session_on_response_ready(session_state_t *session) {
    if (session->state == SESSION_LISTENING) {
        session->state = SESSION_SPEAKING;
    }
}

void session_on_response_complete(session_state_t *session) {
    if (session->state == SESSION_SPEAKING) {
        session->state = SESSION_IDLE;
    }
}

void session_on_timeout(session_state_t *session) {
    if (session->state == SESSION_LISTENING) {
        session->state = SESSION_IDLE;
    }
}
