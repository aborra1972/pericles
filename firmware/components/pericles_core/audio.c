#include "pericles_core.h"
#include <string.h>

pericles_err_t audio_init(audio_handle_t *audio, int sample_rate, int channels, int bits) {
    if (!audio) return PERICLES_ERR_INVALID_ARG;
    
    audio->sample_rate = sample_rate;
    audio->channels = channels;
    audio->bits_per_sample = bits;
    audio->mode = AUDIO_MODE_IDLE;
    audio->buffer_size = 4096;
    
    return PERICLES_OK;
}

pericles_err_t audio_start_capture(audio_handle_t *audio) {
    if (!audio) return PERICLES_ERR_INVALID_ARG;
    audio->mode = AUDIO_MODE_CAPTURING;
    return PERICLES_OK;
}

pericles_err_t audio_stop_capture(audio_handle_t *audio) {
    if (!audio) return PERICLES_ERR_INVALID_ARG;
    audio->mode = AUDIO_MODE_IDLE;
    return PERICLES_OK;
}

pericles_err_t audio_start_playback(audio_handle_t *audio) {
    if (!audio) return PERICLES_ERR_INVALID_ARG;
    audio->mode = AUDIO_MODE_PLAYING;
    return PERICLES_OK;
}

pericles_err_t audio_stop_playback(audio_handle_t *audio) {
    if (!audio) return PERICLES_ERR_INVALID_ARG;
    audio->mode = AUDIO_MODE_IDLE;
    return PERICLES_OK;
}
