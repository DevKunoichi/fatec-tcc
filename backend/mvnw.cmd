@echo off
rem Maven Wrapper para o backend Cinemax
set "MAVEN_CMD=C:\Users\Andresa\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%MAVEN_CMD%" (
    "%MAVEN_CMD%" %*
) else (
    mvn %*
)
