# PAKS

Progress
========
* Protocol (Register , Outsource, Retrieve)
* Multiple keyword Outsource
* Supports basic data

Things to do
============
* Image support
* Multiple keywords retrieval
* Reset password
* Timing

Doubts
======
* Using params in Global functions
* Confirm the functions
* AES IV problem
* ix unencrypted
* salt for KDF
* h Generator P384 (Yet to be decided)

Global Parameters
=================
* Curve NIST P384
* HASH - sha256 (256)
* KDF1 - PBKDF2 (256)
* KDF2 - PBKDF2 (256)
* PRF  - AES in GCM mode with trim to 256
* MAC  - HMAC (256)
