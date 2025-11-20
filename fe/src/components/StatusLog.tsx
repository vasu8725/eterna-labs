import React from 'react';

interface StatusLogProps {
    logs: string[];
}

export const StatusLog: React.FC<StatusLogProps> = ({ logs }) => {
    return (
        <div style={{ marginTop: '2rem', textAlign: 'left', border: '1px solid #444', padding: '1rem', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
            <h3>Execution Logs</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace' }}>
                {logs.length === 0 ? (
                    <div style={{ color: '#888' }}>No logs yet...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
