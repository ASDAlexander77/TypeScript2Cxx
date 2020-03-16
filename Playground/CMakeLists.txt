project(tsc2cxx CXX)
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
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_CXX_EXTENSIONS Off)
set(CMAKE_EXPORT_COMPILE_COMMANDS On)

message("CMAKE_SYSTEM_NAME = ${CMAKE_SYSTEM_NAME}")
message("CMAKE_BUILD_TYPE  = ${CMAKE_BUILD_TYPE}")

# files
file(GLOB Tsc2cxx_SRC
    "${PROJECT_SOURCE_DIR}/*.cpp"
)

include_directories("${PROJECT_SOURCE_DIR}/")
link_directories("${PROJECT_SOURCE_DIR}/")

add_executable (${PROJECT_NAME} "${Tsc2cxx_SRC}")
target_link_libraries (${PROJECT_NAME})
