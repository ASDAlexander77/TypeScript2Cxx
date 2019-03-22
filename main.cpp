#include <iostream>
#include <sstream>
#include <boost/process.hpp>
#include <boost/algorithm/string.hpp>

using namespace std;
using namespace boost;
using namespace boost::process;

int main(int argc, char** argv)
{
    stringstream commandLine;
    for (auto index = 1; index < argc; index++)
    {
        commandLine << argv[index] << " ";
    }

    auto commandLineString = commandLine.str();
    trim_right(commandLineString);

    ipstream outputPipeStream;
    ipstream errorPipeStream;
    child childInstance(commandLineString.c_str(), std_out > outputPipeStream, std_err > errorPipeStream);

    string outputLine;
    string errorLine;
    while (true)
    {
        if (outputPipeStream && getline(outputPipeStream, outputLine))
        {
            cout << outputLine << endl;
            continue;
        }

        if (errorPipeStream && getline(errorPipeStream, errorLine))
        {
            cerr << errorLine << endl;
            continue;
        }        

        break;
    }

    childInstance.wait();

    return 0;
}