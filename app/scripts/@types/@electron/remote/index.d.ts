declare module '@electron/remote' {
    type BrowserWindow = {};

    interface FileFilter {
        name: string;
        extensions: string[];
    }

    interface OpenDialogOpts {
        title?: string;
        defaultPath?: string;
        buttonLabel?: string;
        filters?: FileFilter[];
        properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
        message?: string;
        securityScopedBookmarks?: boolean;
    }

    interface SaveDialogOpts {
        title?: string;
        defaultPath?: string;
        buttonLabel?: string;
        filters?: FileFilter[];
        message?: string;
        nameFieldLabel?: string;
        showsTagField?: boolean;
        properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'>;
        securityScopedBookmarks?: boolean;
    }

    interface Dialog {
        showErrorBox(title: string, message: string): void;
        showOpenDialog(win: BrowserWindow | undefined, options: OpenDialogOpts)
            : Promise<{ canceled: boolean, filePaths: string[], bookmarks?: string[] }>;
        showSaveDialog(win: BrowserWindow | undefined, options: SaveDialogOpts)
            : Promise<{ canceled: boolean, filePath?: string, bookmark?: string }>;
    }

    export const dialog: Dialog;

    export function getCurrentWindow(): BrowserWindow;
}