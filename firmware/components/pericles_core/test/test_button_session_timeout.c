#include "unity.h"
#include "pericles_core.h"
#include <string.h>

// === DEBOUNCE TESTS ===

TEST_CASE("debounce rejects rapid successive presses", "[pericles_core][debounce]") {
    debounce_state_t state;
    debounce_init(&state, 50);  // 50ms debounce window

    // First press registers
    TEST_ASSERT_TRUE(debounce_check(&state, true));
    
    // Rapid second press within 50ms should be rejected
    TEST_ASSERT_FALSE(debounce_check(&state, true));
}

TEST_CASE("debounce accepts press after debounce window", "[pericles_core][debounce]") {
    debounce_state_t state;
    debounce_init(&state, 50);

    // First press
    TEST_ASSERT_TRUE(debounce_check(&state, true));
    
    // Simulate time passing (in real code, this would be a delay)
    debounce_advance_time(&state, 60);
    
    // Second press should register
    TEST_ASSERT_TRUE(debounce_check(&state, true));
}

TEST_CASE("debounce handles contact bounce", "[pericles_core][debounce]") {
    debounce_state_t state;
    debounce_init(&state, 50);

    // Simulate bouncing: press -> release -> press rapidly
    TEST_ASSERT_TRUE(debounce_check(&state, true));
    TEST_ASSERT_FALSE(debounce_check(&state, false));  // bounce release
    TEST_ASSERT_FALSE(debounce_check(&state, true));   // bounce press
}

TEST_CASE("debounce detects release after press", "[pericles_core][debounce]") {
    debounce_state_t state;
    debounce_init(&state, 50);

    TEST_ASSERT_TRUE(debounce_check(&state, true));
    debounce_advance_time(&state, 60);
    TEST_ASSERT_TRUE(debounce_check(&state, false));  // release
}

TEST_CASE("debounce init resets state", "[pericles_core][debounce]") {
    debounce_state_t state;
    debounce_init(&state, 50);
    debounce_check(&state, true);
    debounce_advance_time(&state, 10);
    
    debounce_init(&state, 50);
    // Should be fresh state
    TEST_ASSERT_TRUE(debounce_check(&state, true));
}

// === SESSION TESTS ===

TEST_CASE("session starts on action button press", "[pericles_core][session]") {
    session_state_t session;
    session_init(&session);
    
    TEST_ASSERT_EQUAL(SESSION_IDLE, session.state);
    
    session_on_action_button(&session);
    TEST_ASSERT_EQUAL(SESSION_LISTENING, session.state);
}

TEST_CASE("session stops on second action button press", "[pericles_core][session]") {
    session_state_t session;
    session_init(&session);
    
    session_on_action_button(&session);  // start
    TEST_ASSERT_EQUAL(SESSION_LISTENING, session.state);
    
    session_on_action_button(&session);  // stop
    TEST_ASSERT_EQUAL(SESSION_IDLE, session.state);
}

TEST_CASE("session transitions to speaking state", "[pericles_core][session]") {
    session_state_t session;
    session_init(&session);
    
    session_on_action_button(&session);  // start
    session_on_response_ready(&session);
    TEST_ASSERT_EQUAL(SESSION_SPEAKING, session.state);
}

TEST_CASE("session returns to idle after speaking completes", "[pericles_core][session]") {
    session_state_t session;
    session_init(&session);
    
    session_on_action_button(&session);
    session_on_response_ready(&session);
    session_on_response_complete(&session);
    TEST_ASSERT_EQUAL(SESSION_IDLE, session.state);
}

TEST_CASE("session handles timeout while listening", "[pericles_core][session]") {
    session_state_t session;
    session_init(&session);
    
    session_on_action_button(&session);  // start listening
    session_on_timeout(&session);
    TEST_ASSERT_EQUAL(SESSION_IDLE, session.state);
}

// === TIMEOUT TESTS ===

TEST_CASE("timeout triggers after inactivity", "[pericles_core][timeout]") {
    timeout_state_t timeout;
    timeout_init(&timeout, 1000);  // 1 second timeout
    
    timeout_start(&timeout);
    timeout_advance(&timeout, 1100);  // advance past timeout
    
    TEST_ASSERT_TRUE(timeout_expired(&timeout));
}

TEST_CASE("timeout does not trigger before deadline", "[pericles_core][timeout]") {
    timeout_state_t timeout;
    timeout_init(&timeout, 1000);
    
    timeout_start(&timeout);
    timeout_advance(&timeout, 500);  // advance half way
    
    TEST_ASSERT_FALSE(timeout_expired(&timeout));
}

TEST_CASE("timeout resets on activity", "[pericles_core][timeout]") {
    timeout_state_t timeout;
    timeout_init(&timeout, 1000);
    
    timeout_start(&timeout);
    timeout_advance(&timeout, 500);
    timeout_reset(&timeout);  // activity resets timer
    timeout_advance(&timeout, 500);  // another 500ms
    
    TEST_ASSERT_FALSE(timeout_expired(&timeout));  // total 1000ms but reset at 500ms
}

TEST_CASE("timeout can be restarted", "[pericles_core][timeout]") {
    timeout_state_t timeout;
    timeout_init(&timeout, 1000);
    
    timeout_start(&timeout);
    timeout_advance(&timeout, 500);
    timeout_stop(&timeout);
    timeout_start(&timeout);  // restart
    timeout_advance(&timeout, 500);
    
    TEST_ASSERT_FALSE(timeout_expired(&timeout));  // only 500ms since restart
}
