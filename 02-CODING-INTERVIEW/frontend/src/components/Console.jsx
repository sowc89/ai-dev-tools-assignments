import React from 'react';

const Console = ({ output, loading }) => {
    return (
        <div className="bg-black text-white p-4 h-full overflow-y-auto font-mono text-sm border-t border-gray-700">
            <h3 className="text-gray-400 uppercase text-xs font-bold mb-2">Detailed Execution Output</h3>
            {loading ? (
                <div className="text-yellow-400">Running code...</div>
            ) : (
                <pre className="whitespace-pre-wrap">
                    {output ? output : "Click 'Run Code' to see output here"}
                </pre>
            )}
        </div>
    );
};

export default Console;
