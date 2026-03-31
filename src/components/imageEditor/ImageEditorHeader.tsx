import type React from 'react';

type ImageEditorHeaderProps = {
    isBgConverting: boolean;
    isOverlayConverting: boolean;
    hasBackground: boolean;
    onBgUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOverlayUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
};

const UploadButton = ({
    isBusy,
    idleLabel,
    busyLabel,
    onChange,
}: {
    isBusy: boolean;
    idleLabel: string;
    busyLabel: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <label
        className="upload-btn"
        style={{ opacity: isBusy ? 0.6 : 1, cursor: isBusy ? 'progress' : 'pointer' }}
    >
        {isBusy ? <span className="spinner-inline"></span> : null}
        {isBusy ? busyLabel : idleLabel}
        <input type="file" accept="image/*" onChange={onChange} hidden disabled={isBusy} />
    </label>
);

export const ImageEditorHeader = ({
    isBgConverting,
    isOverlayConverting,
    hasBackground,
    onBgUpload,
    onOverlayUpload,
    onExport,
}: ImageEditorHeaderProps) => (
    <header className="editor-header">
        <h2>Photo Composer</h2>
        <div className="controls-row">
            <UploadButton
                isBusy={isBgConverting}
                idleLabel="Upload Background"
                busyLabel="Converting..."
                onChange={onBgUpload}
            />
            <UploadButton
                isBusy={isOverlayConverting}
                idleLabel="Upload Overlay"
                busyLabel="Converting..."
                onChange={onOverlayUpload}
            />
            <button
                className="export-btn"
                onClick={onExport}
                disabled={!hasBackground || isBgConverting || isOverlayConverting}
            >
                Export PNG
            </button>
        </div>
    </header>
);