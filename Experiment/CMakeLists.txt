project(prj CXX)
cmake_minimum_required(VERSION 3.5 FATAL_ERROR)
set(PROJECT_VERSION 0.0.0.dev0)

# link_directories interprate relative paths with respect to CMAKE_CURRENT_SOURCE_DIR
cmake_policy(SET CMP0015 NEW)

# let cmake autolink dependencies on windows
# it's specified globally, cause qt libraries requires that on windows and they are also found globally
cmake_policy(SET CMP0020 NEW)

# 3.1 and above
cmake_policy(SET CMP0054 NEW)

# SETUP FOR CPP FILES
#set(CMAKE_CXX_STANDARD 17)
#set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_CXX_EXTENSIONS Off)
set(CMAKE_EXPORT_COMPILE_COMMANDS On)

message("CMAKE_SYSTEM_NAME = ${CMAKE_SYSTEM_NAME}")
message("CMAKE_BUILD_TYPE  = ${CMAKE_BUILD_TYPE}")

# files
file(GLOB_RECURSE prj_SRC
    "../Playground/*.cpp",
    "*.cpp"
)

include_directories("./src")
include_directories("../Playground")
link_directories("./")

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    SET(BUILD_TYPE "debug")
else()
    SET(BUILD_TYPE "release")
endif()

if (MSVC)
    SET(BUILD_ARCH "win32")

    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /std:c++latest /Od /Zi /EHsc /DDEBUG /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8")
    #SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /std:c++latest /Ox /EHsc /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /std:c++latest /Ox /EHsc /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /wd4267 /wd4624 /MP8")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /ignore:4006 /ignore:4049 /ignore:4217")
else()
    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -std=c++2a -O0 -ggdb -DDEBUG ${EXTRA_CXX_FLAGS} -Wno-invalid-offsetof")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -std=c++2a -O2 ${EXTRA_CXX_FLAGS} -Wno-invalid-offsetof")
endif()

add_executable (${PROJECT_NAME} "${prj_SRC}")

if (MSVC)
target_link_libraries (${PROJECT_NAME} ${EXTRA_LIBS})
else()
target_link_libraries (${PROJECT_NAME} "stdc++" ${EXTRA_LIBS})
endif()