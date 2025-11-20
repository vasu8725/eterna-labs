import React, { useEffect, useRef } from 'react';

interface LogEntry {
    timestamp: string;
    status: string;
    message: string;
    details?: any;
}

interface LogsListProps {
    logs: LogEntry[];
}

export const LogsList: React.FC<LogsListProps> = ({ logs }) => {
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest log within the container only
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div
            ref={logsContainerRef}
            style={{
                marginTop: '1rem',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#1a1a1a',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #333',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
            }}
        >
            {logs.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center' }}>No logs yet...</div>
            ) : (
                <>
                    {logs.map((log, index) => (
                        <div key={index} style={{
                            marginBottom: '0.5rem',
                            paddingBottom: '0.5rem',
                            borderBottom: index < logs.length - 1 ? '1px solid #2a2a2a' : 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#646cff', fontWeight: 'bold' }}>{formatTime(log.timestamp)}</span>
                                <span style={{
                                    color: '#888',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                }}>{log.status}</span>
                            </div>
                            <div style={{ color: '#e0e0e0' }}>{log.message}</div>
                            {log.details && (
                                <div style={{
                                    marginTop: '0.25rem',
                                    color: '#aaa',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#0a0a0a',
                                    padding: '0.25rem',
                                    borderRadius: '3px'
                                }}>
                                    {JSON.stringify(log.details, null, 2)}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};
