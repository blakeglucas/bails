/*
 _	   __	  _ __
| |	 / /___ _(_) /____
| | /| / / __ `/ / / ___/
| |/ |/ / /_/ / / (__  )
|__/|__/\__,_/_/_/____/
The electron alternative for Go
(c) Lea Anthony 2019-present
*/

import * as Runtime from "../@bails/runtime/src";

import { Enable as EnableWML } from "../@bails/runtime/src/wml";
import { debugLog } from "../@bails/runtime/src/utils";

window.bails = Runtime;
EnableWML();

if (DEBUG) {
    debugLog("Bails Runtime Loaded")
}
