import { loadPyodide } from 'pyodide';

let pyodideInstance = null;

/**
 * Initialize Pyodide (lazy loading)
 */
export async function initPyodide() {
    if (pyodideInstance) {
        return pyodideInstance;
    }

    try {
        pyodideInstance = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
        });
        console.log('Pyodide loaded successfully');
        return pyodideInstance;
    } catch (error) {
        console.error('Failed to load Pyodide:', error);
        throw error;
    }
}

/**
 * Execute Python code using Pyodide (WASM)
 * @param {string} code - Python code to execute
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executePythonWasm(code) {
    try {
        const pyodide = await initPyodide();

        // Redirect stdout to capture print statements
        await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
        `);

        // Execute the user's code
        await pyodide.runPythonAsync(code);

        // Get the output
        const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
        const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

        return {
            output: stdout || '',
            error: stderr || null,
        };
    } catch (error) {
        return {
            output: '',
            error: error.message || 'Python execution failed',
        };
    }
}
