# Bindings Example

This example demonstrates how to generate bindings for your application.

To generate bindings, run `bails generate bindings -clean -b -noevents -time-type=Date -d assets/bindings` in this directory.

See more options by running `bails generate bindings --help`.

## Notes
  - The bindings generator is still a work in progress and is subject to change.
  - The generated code uses `bails.CallByID` by default. This is the most robust way to call a function.
