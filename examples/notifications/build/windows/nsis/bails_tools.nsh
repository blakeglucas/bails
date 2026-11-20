# DO NOT EDIT - Generated automatically by `bails build`

!include "x64.nsh"
!include "WinVer.nsh"
!include "FileFunc.nsh"

!ifndef INFO_PROJECTNAME
    !define INFO_PROJECTNAME "notifications"
!endif
!ifndef INFO_COMPANYNAME
    !define INFO_COMPANYNAME "My Company"
!endif
!ifndef INFO_PRODUCTNAME
    !define INFO_PRODUCTNAME "My Product"
!endif
!ifndef INFO_PRODUCTVERSION
    !define INFO_PRODUCTVERSION "0.1.0"
!endif
!ifndef INFO_COPYRIGHT
    !define INFO_COPYRIGHT "© now, My Company"
!endif
!ifndef PRODUCT_EXECUTABLE
    !define PRODUCT_EXECUTABLE "${INFO_PROJECTNAME}.exe"
!endif
!ifndef UNINST_KEY_NAME
    !define UNINST_KEY_NAME "${INFO_COMPANYNAME}${INFO_PRODUCTNAME}"
!endif
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINST_KEY_NAME}"

!ifndef BAILS_INSTALL_SCOPE
    !define BAILS_INSTALL_SCOPE "machine"
!endif

!ifndef REQUEST_EXECUTION_LEVEL
    !if "${BAILS_INSTALL_SCOPE}" == "user"
        !define REQUEST_EXECUTION_LEVEL "user"
    !else
        !define REQUEST_EXECUTION_LEVEL "admin"
    !endif
!endif

RequestExecutionLevel "${REQUEST_EXECUTION_LEVEL}"

!ifdef ARG_BAILS_AMD64_BINARY
    !define SUPPORTS_AMD64
!endif

!ifdef ARG_BAILS_ARM64_BINARY
    !define SUPPORTS_ARM64
!endif

!ifdef SUPPORTS_AMD64
    !ifdef SUPPORTS_ARM64
        !define ARCH "amd64_arm64"
    !else
        !define ARCH "amd64"
    !endif
!else
    !ifdef SUPPORTS_ARM64
        !define ARCH "arm64"
    !else
        !error "Bails: Undefined ARCH, please provide at least one of ARG_BAILS_AMD64_BINARY or ARG_BAILS_ARM64_BINARY"
    !endif
!endif

!macro bails.checkArchitecture
    !ifndef BAILS_WIN10_REQUIRED
        !define BAILS_WIN10_REQUIRED "This product is only supported on Windows 10 (Server 2016) and later."
    !endif

    !ifndef BAILS_ARCHITECTURE_NOT_SUPPORTED
        !define BAILS_ARCHITECTURE_NOT_SUPPORTED "This product can't be installed on the current Windows architecture. Supports: ${ARCH}"
    !endif

    ${If} ${AtLeastWin10}
        !ifdef SUPPORTS_AMD64
            ${if} ${IsNativeAMD64}
                Goto ok
            ${EndIf}
        !endif

        !ifdef SUPPORTS_ARM64
            ${if} ${IsNativeARM64}
                Goto ok
            ${EndIf}
        !endif

        IfSilent silentArch notSilentArch
        silentArch:
            SetErrorLevel 65
            Abort
        notSilentArch:
            MessageBox MB_OK "${BAILS_ARCHITECTURE_NOT_SUPPORTED}"
            Quit
    ${else}
        IfSilent silentWin notSilentWin
        silentWin:
            SetErrorLevel 64
            Abort
        notSilentWin:
            MessageBox MB_OK "${BAILS_WIN10_REQUIRED}"
            Quit
    ${EndIf}

    ok:
!macroend

!macro bails.files
    !ifdef SUPPORTS_AMD64
        ${if} ${IsNativeAMD64}
            File "/oname=${PRODUCT_EXECUTABLE}" "${ARG_BAILS_AMD64_BINARY}"
        ${EndIf}
    !endif

    !ifdef SUPPORTS_ARM64
        ${if} ${IsNativeARM64}
            File "/oname=${PRODUCT_EXECUTABLE}" "${ARG_BAILS_ARM64_BINARY}"
        ${EndIf}
    !endif
!macroend

!macro bails.writeUninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"

    SetRegView 64
    !if "${BAILS_INSTALL_SCOPE}" == "user"
        WriteRegStr HKCU "${UNINST_KEY}" "Publisher" "${INFO_COMPANYNAME}"
        WriteRegStr HKCU "${UNINST_KEY}" "DisplayName" "${INFO_PRODUCTNAME}"
        WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion" "${INFO_PRODUCTVERSION}"
        WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_EXECUTABLE}"
        WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
        WriteRegStr HKCU "${UNINST_KEY}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"

        ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
        IntFmt $0 "0x%08X" $0
        WriteRegDWORD HKCU "${UNINST_KEY}" "EstimatedSize" "$0"
    !else
        WriteRegStr HKLM "${UNINST_KEY}" "Publisher" "${INFO_COMPANYNAME}"
        WriteRegStr HKLM "${UNINST_KEY}" "DisplayName" "${INFO_PRODUCTNAME}"
        WriteRegStr HKLM "${UNINST_KEY}" "DisplayVersion" "${INFO_PRODUCTVERSION}"
        WriteRegStr HKLM "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_EXECUTABLE}"
        WriteRegStr HKLM "${UNINST_KEY}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
        WriteRegStr HKLM "${UNINST_KEY}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"

        ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
        IntFmt $0 "0x%08X" $0
        WriteRegDWORD HKLM "${UNINST_KEY}" "EstimatedSize" "$0"
    !endif
!macroend

!macro bails.deleteUninstaller
    Delete "$INSTDIR\uninstall.exe"

    SetRegView 64
    !if "${BAILS_INSTALL_SCOPE}" == "user"
        DeleteRegKey HKCU "${UNINST_KEY}"
    !else
        DeleteRegKey HKLM "${UNINST_KEY}"
    !endif
!macroend

!macro bails.setShellContext
    ${If} ${REQUEST_EXECUTION_LEVEL} == "admin"
        SetShellVarContext all
    ${else}
        SetShellVarContext current
    ${EndIf}
!macroend

# Install webview2 by launching the bootstrapper
# See https://docs.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution#online-only-deployment
!macro bails.webview2runtime
    !ifndef BAILS_INSTALL_WEBVIEW_DETAILPRINT
        !define BAILS_INSTALL_WEBVIEW_DETAILPRINT "Installing: WebView2 Runtime"
    !endif

    SetRegView 64
	# If the admin key exists and is not empty then webview2 is already installed
	ReadRegStr $0 HKLM "SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
    ${If} $0 != ""
        Goto ok
    ${EndIf}

    ${If} ${REQUEST_EXECUTION_LEVEL} == "user"
        # If the installer is run in user level, check the user specific key exists and is not empty then webview2 is already installed
	    ReadRegStr $0 HKCU "Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
        ${If} $0 != ""
            Goto ok
        ${EndIf}
     ${EndIf}
    
	SetDetailsPrint both
    DetailPrint "${BAILS_INSTALL_WEBVIEW_DETAILPRINT}"
    SetDetailsPrint listonly
    
    InitPluginsDir
    CreateDirectory "$pluginsdir\webview2bootstrapper"
    SetOutPath "$pluginsdir\webview2bootstrapper"
    File "MicrosoftEdgeWebview2Setup.exe"
    ExecWait '"$pluginsdir\webview2bootstrapper\MicrosoftEdgeWebview2Setup.exe" /silent /install'
    
    SetDetailsPrint both
    ok:
!macroend

# Copy of APP_ASSOCIATE and APP_UNASSOCIATE macros from here https://gist.github.com/nikku/281d0ef126dbc215dd58bfd5b3a5cd5b
!macro APP_ASSOCIATE EXT FILECLASS DESCRIPTION ICON COMMANDTEXT COMMAND
  ; Backup the previously associated file class
  ReadRegStr $R0 SHELL_CONTEXT "Software\Classes\.${EXT}" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\.${EXT}" "${FILECLASS}_backup" "$R0"

  WriteRegStr SHELL_CONTEXT "Software\Classes\.${EXT}" "" "${FILECLASS}"

  WriteRegStr SHELL_CONTEXT "Software\Classes\${FILECLASS}" "" `${DESCRIPTION}`
  WriteRegStr SHELL_CONTEXT "Software\Classes\${FILECLASS}\DefaultIcon" "" `${ICON}`
  WriteRegStr SHELL_CONTEXT "Software\Classes\${FILECLASS}\shell" "" "open"
  WriteRegStr SHELL_CONTEXT "Software\Classes\${FILECLASS}\shell\open" "" `${COMMANDTEXT}`
  WriteRegStr SHELL_CONTEXT "Software\Classes\${FILECLASS}\shell\open\command" "" `${COMMAND}`
!macroend

!macro APP_UNASSOCIATE EXT FILECLASS
  ; Backup the previously associated file class
  ReadRegStr $R0 SHELL_CONTEXT "Software\Classes\.${EXT}" `${FILECLASS}_backup`
  WriteRegStr SHELL_CONTEXT "Software\Classes\.${EXT}" "" "$R0"

  DeleteRegKey SHELL_CONTEXT `Software\Classes\${FILECLASS}`
!macroend

!macro bails.associateFiles
    ; Create file associations
    
!macroend

!macro bails.unassociateFiles
    ; Delete app associations
    
!macroend