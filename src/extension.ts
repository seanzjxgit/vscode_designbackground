import { commands, ExtensionContext, window, workspace } from 'vscode';
import { PickList, ActionType } from './PickList';
import { setContext } from './global';
import { StudioViewProvider } from './StudioViewProvider';
import { setCurrentBlur, setCurrentImagePath, setCurrentOpacity } from './windowBackground';

export function activate(context: ExtensionContext): void {
    setContext(context);
    const studio = new StudioViewProvider(context);
    context.subscriptions.push(window.registerWebviewViewProvider(StudioViewProvider.viewType, studio, { webviewOptions: { retainContextWhenHidden: true } }));
    context.subscriptions.push(commands.registerCommand('vscode_desginbackground.open', async () => { await commands.executeCommand('workbench.view.extension.backgroundCover-explorer'); studio.pushState(); }));
    context.subscriptions.push(commands.registerCommand('vscode_desginbackground.selectImage', () => runAction(ActionType.SelectPictures)));
    context.subscriptions.push(commands.registerCommand('vscode_desginbackground.clear', () => runAction(ActionType.CloseBackground)));
    context.subscriptions.push(commands.registerCommand('backgroundCover.runAction', runAction));
    context.subscriptions.push(commands.registerCommand('backgroundCover.setConfig', setConfig));
    void PickList.applyCurrentBackground();
}

async function runAction(action: ActionType, path?: string): Promise<void> {
    await new PickList(workspace.getConfiguration('backgroundCover')).handleAction(action, path);
}

async function setConfig(key: string, value: unknown): Promise<void> {
    const cfg = workspace.getConfiguration('backgroundCover');
    if (key === 'backgroundCover.imagePath') await setCurrentImagePath(typeof value === 'string' ? value : '');
    else if (key === 'backgroundCover.opacity' && typeof value === 'number') await setCurrentOpacity(value, cfg);
    else if (key === 'backgroundCover.blur' && typeof value === 'number') await setCurrentBlur(value, cfg);
    else await cfg.update(key.replace(/^backgroundCover\./, ''), value, true);
    await PickList.applyCurrentBackground();
}

export function deactivate(): void {}
