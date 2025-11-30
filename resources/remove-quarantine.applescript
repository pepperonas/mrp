-- AppleScript zum automatischen Entfernen des Quarantäne-Attributs
-- Wird ausgeführt, wenn die App nach Applications kopiert wird

on run
    try
        set appPath to POSIX path of (path to applications folder) & "Metaprompt.app"
        
        -- Prüfe ob die App existiert
        if (do shell script "test -d " & quoted form of appPath) then
            -- Entferne Quarantäne-Attribut
            do shell script "xattr -d com.apple.quarantine " & quoted form of appPath & " 2>/dev/null || true"
            
            display notification "Metaprompt.app ist bereit!" with title "Installation erfolgreich" sound name "Glass"
        end if
    on error errMsg
        -- Fehler ignorieren (App wurde vielleicht noch nicht kopiert)
    end try
end run
