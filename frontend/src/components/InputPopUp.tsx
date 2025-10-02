import React, { useState } from 'react';
import { useReportStore } from '../stores/reportStore';

interface InputPopUpProps {
    open: boolean;
    onCancel: () => void;
    placeholder?: string;
    reportId: string;
    token: string;
}

export const InputPopUp: React.FC<InputPopUpProps> = ({
    open,
    onCancel,
    placeholder = 'Enter value...',
    reportId,
    token
}) => {
    const [inputValue, setInputValue] = useState('');
    const {addFeedback} = useReportStore();

    const handleAddFeedback = (reportId: string, token: string) => {
        if (inputValue.trim()) {
            addFeedback(reportId, 'reviewed', inputValue, token);
        }
        setInputValue('');
    };  

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] flex flex-col gap-4">
                <input
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={e => setInputValue(e.target.value)}
                    className="p-2 text-lg border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            handleAddFeedback(reportId, token);
                        }}
                        disabled={!inputValue.trim()}
                        className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed`}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

