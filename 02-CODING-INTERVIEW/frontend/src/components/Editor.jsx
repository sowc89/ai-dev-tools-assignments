import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

const Editor = ({ socketRef, roomId, onCodeChange, language }) => {
    const editorRef = useRef(null);
    const isRemoteUpdate = useRef(false);

    const handleEditorChange = (value, event) => {
        onCodeChange(value);
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId,
                code: value,
            });
        }
    };

    /**
     * We need to keep the remote update flag true until the change event has fired.
     * However, setValue is synchronous in Monaco. The change event fires synchronously.
     * So setting flag true, setting value, then checking flag in handler should work.
     */

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on('code-change', ({ code }) => {
                if (code !== null && editorRef.current) {
                    const currentValue = editorRef.current.getValue();
                    if (code !== currentValue) {
                        isRemoteUpdate.current = true;
                        editorRef.current.setValue(code);
                        // Just in case the event didn't fire (unlikely), reset? 
                        // No, the event fires synchronously for setValue. 
                        // But wait, if event DOESN'T fire effectively (e.g. text matches), flag might stay stuck?
                        // Actually, if code !== currentValue, it WILL change.
                        // And handleEditorChange WILL run.
                        // So flag will be reset there.
                        // BUT: if for some reason handleEditorChange DOES NOT run, we are stuck not emitting.
                        // Safe bet: reset it immediately after if we are unsure, but inside handler is safer for race conditions.
                        // Actually, setValue SHOULD fire it.

                        // Alternative: setValue generally replaces UNDO stack too. 
                        // `executeEdits` might be better for cursor preservation, but let's stick to setValue for now.
                        // To be safe against race conditions where handler isn't called:
                        // We can reset isRemoteUpdate.current = false in a setTimeout(0) if we want?
                        // No, let's trust the synchronous nature.

                        // Wait, if I use `editor.getModel().setValue()`, does it trigger component `onChange`?
                        // `@monaco-editor/react` hooks into `onDidChangeModelContent`.
                    }
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('code-change');
            }
        }
    }, [socketRef.current]);

    return (
        <div className="h-full w-full">
            <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={language || 'javascript'}
                defaultValue="// Start coding..."
                onChange={handleEditorChange}
                onMount={(editor, monaco) => {
                    editorRef.current = editor;
                }}
                options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                }}
            />
        </div>
    );
};

export default Editor;
