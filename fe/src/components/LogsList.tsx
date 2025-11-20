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
            className="mt-2 max-h-[200px] overflow-y-auto bg-black/40 p-3 rounded-md border border-gray-800 font-mono text-xs custom-scrollbar"
        >
            {logs.length === 0 ? (
                <div className="text-gray-600 text-center py-4 italic">Waiting for logs...</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {logs.map((log, index) => (
                        <div key={index} className={`
                            pb-2 border-b border-gray-800/50 last:border-0 last:pb-0
                            animate-in fade-in slide-in-from-bottom-1 duration-300
                        `}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-blue-400 font-bold opacity-90">{formatTime(log.timestamp)}</span>
                                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold bg-gray-900 px-1.5 py-0.5 rounded">
                                    {log.status}
                                </span>
                            </div>
                            <div className="text-gray-300 leading-relaxed pl-2 border-l-2 border-gray-800">{log.message}</div>
                            {log.details && (
                                <div className="mt-1.5 ml-2 text-gray-500 text-[10px] bg-gray-900/80 p-2 rounded border border-gray-800 overflow-x-auto">
                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
