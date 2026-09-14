import * as fs from 'fs';
import * as path from 'path';
import { commands, ExtensionContext, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, workspace } from 'vscode';
import { resolveCurrentBlur, resolveCurrentImagePath, resolveCurrentOpacity } from './windowBackground';

export class StudioViewProvider implements WebviewViewProvider {
    static readonly viewType = 'backgroundCover.studio';
    private view: WebviewView | undefined;
    constructor(private readonly context: ExtensionContext) {}
    resolveWebviewView(view: WebviewView, _context: WebviewViewResolveContext): void {
        this.view = view;
        view.webview.options = { enableScripts: true, localResourceRoots: [this.context.extensionUri] };
        view.webview.html = this.html(view.webview);
        view.webview.onDidReceiveMessage(async message => {
            if (message?.type === 'ready') { this.pushState(); return; }
            if (message?.type === 'action') await commands.executeCommand('backgroundCover.runAction', message.action);
            if (message?.type === 'setConfig' && typeof message.key === 'string') await commands.executeCommand('backgroundCover.setConfig', `backgroundCover.${message.key}`, message.value);
            this.pushState();
        });
        workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('backgroundCover')) this.pushState(); });
    }
    pushState(): void {
        if (!this.view) return;
        const cfg = workspace.getConfiguration('backgroundCover');
        const imagePath = resolveCurrentImagePath(cfg.get<string>('imagePath') || '');
        let preview = '';
        try {
            if (imagePath && fs.existsSync(imagePath)) {
                // A webview can only load local files below localResourceRoots. Wallpaper
                // files normally live outside the extension installation, so permit the
                // selected image's directory before converting it to a webview URI.
                const imageUri = Uri.file(imagePath);
                this.view.webview.options = {
                    enableScripts: true,
                    localResourceRoots: [this.context.extensionUri, Uri.file(path.dirname(imagePath))]
                };
                preview = this.view.webview.asWebviewUri(imageUri).toString();
            }
        } catch { /* The panel remains usable if the selected file cannot be read. */ }
        this.view.webview.postMessage({ type: 'state', data: { imagePath, preview, opacity: resolveCurrentOpacity(cfg.get<number>('opacity') || 0.2), blur: resolveCurrentBlur(cfg.get<number>('blur') || 0), sizeModel: cfg.get<string>('sizeModel') || 'cover', blendModel: cfg.get<string>('blendModel') || 'auto' } });
    }
    private html(webview: Webview): string {
        try {
            const nonce = Math.random().toString(36).slice(2);
            return fs.readFileSync(path.join(this.context.extensionPath, 'webview-dist', 'index.html'), 'utf8').replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'">`).replace(/<script/g, `<script nonce="${nonce}"`);
        } catch { return '<p>Build the webview before running the extension.</p>'; }
    }
}
