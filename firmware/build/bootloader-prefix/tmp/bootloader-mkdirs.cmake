# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/home/ale/esp-idf/components/bootloader/subproject"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/tmp"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/src/bootloader-stamp"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/src"
  "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/media/ale/Windows/Users/aleja/Documents/Proyectos/pericles/firmware/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
