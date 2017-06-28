#PAKS

Progress
========
* Protocol (Register , Outsource, Retrieve)
* Supports basic data

Things to do
============
* Validation
* UI tweaks
* Image support
* Multiple keywords
* Reset password

Doubts
======
* Using params in Global functions
* Confirm the functions
* AES IV problem
* ix unencrypted
* salt for KDF

Global Parameters
=================
* Curve NIST P384
* h Generator P384 (Yet to be decided)
* HASH - sha256 (256)
* KDF1 - PBKDF2 (256)
* KDF2 - PBKDF2 (256)
* PRF  - AES in GCM mode with trim to 256
* MAC  - HMAC (256)
