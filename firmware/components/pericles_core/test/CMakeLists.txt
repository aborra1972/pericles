# Test component for pericles_core
# Tests are compiled as part of the main build when running on device
idf_component_register(SRCS ""
                       INCLUDE_DIRS "."
                       REQUIRES pericles_core unity)
