list(APPEND CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake")

set(CMAKE_CONFIGURATION_TYPES Release RelWithDebInfo Debug)
set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type on single-configuration generators")

set(HUNTER_CONFIGURATION_TYPES Release)
set(HUNTER_CACHE_SERVERS "https://github.com/ethereum/hunter-cache")
include(HunterGate)
HunterGate(
    URL "https://github.com/ruslo/hunter/archive/v0.19.144.tar.gz"
    SHA1 "e3efd470f8b60468db8730eac8c04792f77fe1b1"
    LOCAL
)

project(guard)
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
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_CXX_EXTENSIONS Off)

# BOOST
hunter_add_package(Boost COMPONENTS system filesystem)

set(Boost_USE_STATIC_LIBS ON)
if (MSVC)
	set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} /DBOOST_ALL_NO_LIB=1")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /DBOOST_ALL_NO_LIB=1")
else()
	set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DBOOST_ALL_NO_LIB=1")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DBOOST_ALL_NO_LIB=1")
	if(MINGW)
	  	set(LIBS ${LIBS} "ws2_32")
	endif()
endif()
find_package(Boost REQUIRED COMPONENTS system filesystem)

if (Boost_FOUND)
  include_directories (SYSTEM ${Boost_INCLUDE_DIR})
  link_directories (${Boost_LIBRARY_DIRS})
  set(EXTRA_LIBS ${EXTRA_LIBS} ${Boost_LIBRARIES})
else()
    message("Boost_FOUND NOT FOUND")
endif ()

message("CMAKE_SYSTEM_NAME = ${CMAKE_SYSTEM_NAME}")
message("CMAKE_BUILD_TYPE  = ${CMAKE_BUILD_TYPE}")

# files
file(GLOB Guard_SRC
    "*.cpp"
)

include_directories("./")
link_directories("./")

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    SET(BUILD_TYPE "debug")
else()
    SET(BUILD_TYPE "release")
endif()

if (MSVC)
    SET(BUILD_ARCH "win32")

    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /Od /Zi /EHsc /DDEBUG /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /Ox /EHsc /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /ignore:4006 /ignore:4049 /ignore:4217")
else()
    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -ggdb -DDEBUG ${EXTRA_CXX_FLAGS} -Wno-invalid-offsetof")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 ${EXTRA_CXX_FLAGS} -Wno-invalid-offsetof")
endif()

if (CMAKE_SYSTEM_NAME STREQUAL "Linux")
    SET(EXTRA_LIBS ${EXTRA_LIBS} "pthread")
endif()

if (MINGW)
    SET(EXTRA_LIBS ${EXTRA_LIBS} "ws2_32")
endif()

add_executable (${PROJECT_NAME} "${Guard_SRC}")

if (MSVC)
target_link_libraries (${PROJECT_NAME} ${EXTRA_LIBS})
else()
target_link_libraries (${PROJECT_NAME} "stdc++" "stdc++fs" ${EXTRA_LIBS})
endif()