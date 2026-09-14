# vscode-designbackground

A focused VS Code extension for using a local image as the editor background.

## Features

- Select or clear a local wallpaper from the Wallpaper activity-bar view.
- Adjust opacity and blur.
- Choose cover, contain, repeat, or center image fitting.
- Choose an editor blend mode.

The extension modifies the installed VS Code workbench assets to render the wallpaper. VS Code may request elevated file permissions and a reload can be required after the first application or after a VS Code update.

## Development

```sh
npm install
npm run build:webview
npm run compile
```

## License

This project is distributed under the MIT License. The original copyright and permission notice are retained in [LICENSE](LICENSE).
